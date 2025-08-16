"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Eye, Camera, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ImageData {
  file: File | null;
  url: string;
  name: string;
}

export default function VisualComparisonPage() {
  const [leftImage, setLeftImage] = useState<ImageData>({
    file: null,
    url: '',
    name: 'Production'
  });
  
  const [rightImage, setRightImage] = useState<ImageData>({
    file: null,
    url: '',
    name: 'Staging'
  });
  
  const [isCapturing, setIsCapturing] = useState<{left: boolean, right: boolean}>({
    left: false,
    right: false
  });
  
  const [analysisPrompt, setAnalysisPrompt] = useState(
    `Compare these two website screenshots and identify visual differences. Look for:

• Layout inconsistencies and spacing issues
• Typography changes (fonts, sizes, weights)
• Color variations and contrast differences  
• Missing or misaligned elements
• Animation states and loading indicators
• Mobile responsiveness differences
• Interactive element styling (buttons, links, forms)

Provide specific, actionable feedback for achieving pixel-perfect alignment between the staging and production versions.`
  );
  
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((side: 'left' | 'right') => {
    const input = side === 'left' ? leftInputRef.current : rightInputRef.current;
    if (!input?.files?.[0]) return;

    const file = input.files[0];
    const url = URL.createObjectURL(file);
    
    if (side === 'left') {
      setLeftImage(prev => ({ ...prev, file, url }));
    } else {
      setRightImage(prev => ({ ...prev, file, url }));
    }
  }, []);

  const captureScreenshot = useCallback(async (side: 'left' | 'right', url: string) => {
    if (!url) return;
    
    setIsCapturing(prev => ({ ...prev, [side]: true }));
    
    try {
      const response = await fetch('/api/og-screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          name: side === 'left' ? leftImage.name : rightImage.name,
          width: 1200,
          height: 630
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (side === 'left') {
          setLeftImage(prev => ({ ...prev, url: result.screenshot, file: null }));
        } else {
          setRightImage(prev => ({ ...prev, url: result.screenshot, file: null }));
        }
        console.log(`✅ OG Screenshot captured for ${side}`);
      } else {
        console.error(`❌ OG Screenshot failed for ${side}:`, result.error);
        alert(`Failed to capture screenshot: ${result.error}`);
      }
      
    } catch (error) {
      console.error(`❌ OG Screenshot API error for ${side}:`, error);
      alert(`Network error capturing screenshot: ${error}`);
    } finally {
      setIsCapturing(prev => ({ ...prev, [side]: false }));
    }
  }, [leftImage.name, rightImage.name]);

  const handleUrlInput = useCallback((side: 'left' | 'right', url: string) => {
    if (side === 'left') {
      setLeftImage(prev => ({ ...prev, url, file: null }));
    } else {
      setRightImage(prev => ({ ...prev, url, file: null }));
    }
    
    // Auto-capture screenshot if URL looks valid
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      captureScreenshot(side, url);
    }
  }, [captureScreenshot]);

  const handleDrop = useCallback((e: React.DragEvent, side: 'left' | 'right') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const url = URL.createObjectURL(file);
    if (side === 'left') {
      setLeftImage(prev => ({ ...prev, file, url }));
    } else {
      setRightImage(prev => ({ ...prev, file, url }));
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const loadSampleImages = useCallback(async () => {
    const productionUrl = 'https://internetfriends.xyz';
    const stagingUrl = 'https://nextjs-website-a92ygj6bi-internetfriends.vercel.app';
    
    setLeftImage({
      file: null,
      url: productionUrl,
      name: 'Production (InternetFriends.xyz)'
    });
    
    setRightImage({
      file: null,
      url: stagingUrl,
      name: 'Staging (Vercel Preview)'
    });
    
    // Capture screenshots automatically
    await Promise.all([
      captureScreenshot('left', productionUrl),
      captureScreenshot('right', stagingUrl)
    ]);
  }, [captureScreenshot]);

  const generateLLMFriendlyOutput = useCallback(() => {
    const output = {
      images: {
        production: {
          name: leftImage.name,
          url: leftImage.url,
          hasFile: !!leftImage.file
        },
        staging: {
          name: rightImage.name,
          url: rightImage.url,
          hasFile: !!rightImage.file
        }
      },
      prompt: analysisPrompt,
      instructions: {
        tools: [
          "Claude (Anthropic) - Upload both images with prompt",
          "ChatGPT Vision (OpenAI) - GPT-4V with image analysis",
          "Gemini Vision (Google) - Multi-modal comparison"
        ],
        format: "Copy the prompt below and upload both images to your preferred AI vision model"
      },
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(output, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visual-comparison-analysis.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [leftImage, rightImage, analysisPrompt]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          🎯 Visual Comparison Tool
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Upload screenshots or enter URLs to compare websites visually. Generate AI-friendly analysis prompts for detailed feedback.
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={loadSampleImages} 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={isCapturing.left || isCapturing.right}
          >
            <Zap className="h-4 w-4" />
            {isCapturing.left || isCapturing.right ? 'Capturing Screenshots...' : 'Load Sample URLs'}
          </Button>
          <Button onClick={generateLLMFriendlyOutput} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export for AI Analysis
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Left Image Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-500" />
              {leftImage.name}
            </CardTitle>
            <CardDescription>
              Upload an image file or enter a URL for the first comparison target
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="left-name">Display Name</Label>
              <Input
                id="left-name"
                value={leftImage.name}
                onChange={(e) => setLeftImage(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Production"
              />
            </div>
            
            <div>
              <Label htmlFor="left-url">URL (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="left-url"
                value={leftImage.url}
                onChange={(e) => handleUrlInput('left', e.target.value)}
                placeholder="https://example.com"
                className="flex-1"
              />
              <Button
                onClick={() => captureScreenshot('left', leftImage.url)}
                disabled={!leftImage.url || isCapturing.left}
                size="sm"
                variant="outline"
              >
                {isCapturing.left ? '📸' : <Camera className="h-4 w-4" />}
              </Button>
            </div>
            </div>

            <div>
              <Label htmlFor="left-file">Upload Image</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onDrop={(e) => handleDrop(e, 'left')}
                onDragOver={handleDragOver}
                onClick={() => leftInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drop an image here or click to upload
                </p>
                <Input
                  ref={leftInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() => handleFileUpload('left')}
                />
              </div>
            </div>

            {(leftImage.url && !isCapturing.left) && (
              <div className="mt-4">
                <img
                  src={leftImage.url}
                  alt={leftImage.name}
                  className="w-full rounded-lg border shadow-sm"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>
            )}
            
            {isCapturing.left && (
              <div className="mt-4 p-8 border border-blue-200 rounded-lg bg-blue-50 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-blue-700 font-medium">Capturing screenshot...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Image Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-green-500" />
              {rightImage.name}
            </CardTitle>
            <CardDescription>
              Upload an image file or enter a URL for the second comparison target
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="right-name">Display Name</Label>
              <Input
                id="right-name"
                value={rightImage.name}
                onChange={(e) => setRightImage(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Staging"
              />
            </div>
            
            <div>
              <Label htmlFor="right-url">URL (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="right-url"
                value={rightImage.url}
                onChange={(e) => handleUrlInput('right', e.target.value)}
                placeholder="https://staging.example.com"
                className="flex-1"
              />
              <Button
                onClick={() => captureScreenshot('right', rightImage.url)}
                disabled={!rightImage.url || isCapturing.right}
                size="sm"
                variant="outline"
              >
                {isCapturing.right ? '📸' : <Camera className="h-4 w-4" />}
              </Button>
            </div>
            </div>

            <div>
              <Label htmlFor="right-file">Upload Image</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
                onDrop={(e) => handleDrop(e, 'right')}
                onDragOver={handleDragOver}
                onClick={() => rightInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drop an image here or click to upload
                </p>
                <Input
                  ref={rightInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() => handleFileUpload('right')}
                />
              </div>
            </div>

            {(rightImage.url && !isCapturing.right) && (
              <div className="mt-4">
                <img
                  src={rightImage.url}
                  alt={rightImage.name}
                  className="w-full rounded-lg border shadow-sm"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>
            )}
            
            {isCapturing.right && (
              <div className="mt-4 p-8 border border-green-200 rounded-lg bg-green-50 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-green-700 font-medium">Capturing screenshot...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Prompt Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-500" />
            AI Analysis Prompt
          </CardTitle>
          <CardDescription>
            Customize the prompt that will be used for AI-powered visual analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={analysisPrompt}
            onChange={(e) => setAnalysisPrompt(e.target.value)}
            rows={12}
            className="font-mono text-sm"
            placeholder="Enter your analysis prompt here..."
          />
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 AI Tools You Can Use:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Claude</strong> (Anthropic) - Upload both images with your prompt</li>
              <li>• <strong>ChatGPT Vision</strong> (OpenAI) - GPT-4V with image analysis capabilities</li>
              <li>• <strong>Gemini Vision</strong> (Google) - Multi-modal comparison and analysis</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Comparison */}
      {leftImage.url && rightImage.url && !isCapturing.left && !isCapturing.right && (
        <Card>
          <CardHeader>
            <CardTitle>🔍 Side-by-Side Comparison</CardTitle>
            <CardDescription>
              Visual comparison of both images for quick review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-blue-600">{leftImage.name}</h4>
                <img
                  src={leftImage.url}
                  alt={leftImage.name}
                  className="w-full rounded-lg border shadow-sm"
                />
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-600">{rightImage.name}</h4>
                <img
                  src={rightImage.url}
                  alt={rightImage.name}
                  className="w-full rounded-lg border shadow-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}