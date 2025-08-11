/**
 * Gloo Debug Helper Script
 * Load this in browser console or include in HTML for Gloo troubleshooting
 *
 * Usage in console:
 *   const script = document.createElement('script');
 *   script.src = '/debug/gloo-debug.js';
 *   document.head.appendChild(script);
 *
 * Or add to HTML:
 *   <script src="/debug/gloo-debug.js"></script>
 */

(function() {
  'use strict';

  const GlooDebugHelper = {
    version: '1.0.0',

    // Quick health check
    healthCheck() {
      console.group('🩺 Gloo Health Check');

      const results = {
        webglSupport: this.checkWebGLSupport(),
        canvasFound: !!document.querySelector('[data-testid="gloo-canvas"]'),
        globalWrapperFound: !!document.querySelector('[data-gloo-global]'),
        debugMode: new URLSearchParams(window.location.search).has('glooDebug')
      };

      Object.entries(results).forEach(([key, value]) => {
        console.log(`${key}: ${value ? '✅' : '❌'}`);
      });

      if (!results.webglSupport) {
        console.warn('❌ WebGL not supported - visit chrome://gpu/ to check status');
      }

      if (!results.canvasFound) {
        console.warn('❌ Canvas not found - Gloo may not be mounted');
      }

      console.groupEnd();
      return results;
    },

    // Check WebGL support
    checkWebGLSupport() {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch (e) {
        return false;
      }
    },

    // Detailed canvas analysis
    analyzeCanvas() {
      const canvas = document.querySelector('[data-testid="gloo-canvas"]');
      if (!canvas) {
        console.error('❌ Canvas not found');
        return null;
      }

      console.group('🔍 Canvas Analysis');

      const rect = canvas.getBoundingClientRect();
      const style = getComputedStyle(canvas);
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      const analysis = {
        dimensions: {
          client: { width: rect.width, height: rect.height },
          canvas: { width: canvas.width, height: canvas.height },
          visible: rect.width > 0 && rect.height > 0
        },
        style: {
          display: style.display,
          visibility: style.visibility,
          opacity: parseFloat(style.opacity),
          zIndex: style.zIndex,
          position: style.position
        },
        webgl: {
          context: !!gl,
          vendor: gl?.getParameter(gl.VENDOR),
          renderer: gl?.getParameter(gl.RENDERER),
          version: gl?.getParameter(gl.VERSION)
        },
        attributes: {
          effect: canvas.parentElement?.getAttribute('data-gloo-effect'),
          playing: canvas.parentElement?.getAttribute('data-gloo-playing'),
          index: canvas.parentElement?.getAttribute('data-gloo-index')
        }
      };

      console.table(analysis.dimensions);
      console.table(analysis.style);
      console.table(analysis.webgl);
      console.table(analysis.attributes);

      // Check for covering elements
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const topElement = document.elementFromPoint(centerX, centerY);

      if (topElement && topElement !== canvas) {
        console.warn('⚠️ Canvas may be covered by:', topElement);
      }

      console.groupEnd();
      return analysis;
    },

    // Global wrapper analysis
    analyzeGlobalWrapper() {
      const wrapper = document.querySelector('[data-gloo-global]');
      if (!wrapper) {
        console.error('❌ Global wrapper not found');
        return null;
      }

      console.group('🌍 Global Wrapper Analysis');

      const style = getComputedStyle(wrapper);
      const analysis = {
        attributes: {
          theme: wrapper.getAttribute('data-gloo-theme'),
          strategy: wrapper.getAttribute('data-gloo-strategy'),
          epic: wrapper.getAttribute('data-gloo-epic'),
          epicPhase: wrapper.getAttribute('data-gloo-epic-phase')
        },
        style: {
          position: style.position,
          zIndex: style.zIndex,
          display: style.display,
          isolation: style.isolation,
          willChange: style.willChange
        },
        children: {
          canvas: wrapper.querySelector('[data-testid="gloo-canvas"]') ? '✅' : '❌',
          debugOverlay: wrapper.querySelector('[style*="rgba(255, 0, 0"]') ? '✅' : '❌'
        }
      };

      console.table(analysis.attributes);
      console.table(analysis.style);
      console.table(analysis.children);

      console.groupEnd();
      return analysis;
    },

    // Force debug mode
    enableDebugMode() {
      const url = new URL(window.location);
      url.searchParams.set('glooDebug', '1');
      console.log('🔧 Enabling debug mode...');
      window.location.href = url.toString();
    },

    // Disable debug mode
    disableDebugMode() {
      const url = new URL(window.location);
      url.searchParams.delete('glooDebug');
      console.log('🔧 Disabling debug mode...');
      window.location.href = url.toString();
    },

    // Test canvas rendering
    testCanvasRender() {
      const canvas = document.querySelector('[data-testid="gloo-canvas"]');
      if (!canvas) {
        console.error('❌ Canvas not found');
        return;
      }

      console.group('🎨 Canvas Render Test');

      try {
        // Capture two frames 100ms apart
        const frame1 = canvas.toDataURL();

        setTimeout(() => {
          const frame2 = canvas.toDataURL();
          const isAnimating = frame1 !== frame2;

          console.log('Animation detected:', isAnimating ? '✅' : '❌');
          console.log('Frame 1 size:', frame1.length, 'bytes');
          console.log('Frame 2 size:', frame2.length, 'bytes');

          if (!isAnimating) {
            console.warn('⚠️ Canvas appears static - check animation settings');
          }

          // Check if canvas is mostly transparent
          const ctx = document.createElement('canvas').getContext('2d');
          const testCanvas = document.createElement('canvas');
          testCanvas.width = canvas.width;
          testCanvas.height = canvas.height;
          const testCtx = testCanvas.getContext('2d');

          const img = new Image();
          img.onload = () => {
            testCtx.drawImage(img, 0, 0);
            const imageData = testCtx.getImageData(0, 0, testCanvas.width, testCanvas.height);

            let nonTransparentPixels = 0;
            for (let i = 3; i < imageData.data.length; i += 4) {
              if (imageData.data[i] > 0) nonTransparentPixels++;
            }

            const totalPixels = imageData.data.length / 4;
            const visibilityPercent = (nonTransparentPixels / totalPixels * 100).toFixed(1);

            console.log(`Visible pixels: ${visibilityPercent}%`);
            if (visibilityPercent < 1) {
              console.warn('⚠️ Canvas appears mostly transparent');
            }

            console.groupEnd();
          };
          img.src = frame2;
        }, 100);
      } catch (e) {
        console.error('❌ Canvas render test failed:', e);
        console.groupEnd();
      }
    },

    // Capture frame for inspection
    captureFrame() {
      const canvas = document.querySelector('[data-testid="gloo-canvas"]');
      if (!canvas) {
        console.error('❌ Canvas not found');
        return;
      }

      try {
        const link = document.createElement('a');
        link.download = `gloo-frame-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        console.log('✅ Frame captured and downloaded');
      } catch (e) {
        console.error('❌ Frame capture failed:', e);
      }
    },

    // Apply emergency visibility fix
    emergencyFix() {
      console.log('🚨 Applying emergency visibility fixes...');

      const canvas = document.querySelector('[data-testid="gloo-canvas"]');
      const wrapper = document.querySelector('[data-gloo-global]');

      if (wrapper) {
        wrapper.style.zIndex = '999';
        wrapper.style.position = 'fixed';
        wrapper.style.isolation = 'isolate';
        console.log('✅ Fixed global wrapper z-index and positioning');
      }

      if (canvas) {
        canvas.style.opacity = '1';
        canvas.style.visibility = 'visible';
        canvas.style.display = 'block';
        console.log('✅ Fixed canvas visibility');
      }

      // Temporarily override body background
      const originalBg = document.body.style.background;
      document.body.style.background = 'transparent';

      console.log('✅ Made body background transparent (temporary)');
      console.log('💡 Run GlooDebugHelper.revertEmergencyFix() to undo');

      this._originalBodyBg = originalBg;
    },

    // Revert emergency fixes
    revertEmergencyFix() {
      if (this._originalBodyBg !== undefined) {
        document.body.style.background = this._originalBodyBg;
        console.log('✅ Reverted body background');
      }

      const wrapper = document.querySelector('[data-gloo-global]');
      if (wrapper) {
        wrapper.style.zIndex = '';
        wrapper.style.isolation = '';
        console.log('✅ Reverted wrapper styles');
      }

      console.log('✅ Emergency fixes reverted');
    },

    // Run comprehensive diagnostic
    fullDiagnostic() {
      console.group('🔬 Gloo Full Diagnostic');

      this.healthCheck();
      console.log('---');
      this.analyzeCanvas();
      console.log('---');
      this.analyzeGlobalWrapper();
      console.log('---');
      this.testCanvasRender();

      console.groupEnd();
    },

    // Show help
    help() {
      console.log(`
🎭 Gloo Debug Helper v${this.version}

Available Commands:
------------------
GlooDebugHelper.healthCheck()      - Quick health check
GlooDebugHelper.analyzeCanvas()    - Detailed canvas analysis
GlooDebugHelper.analyzeGlobalWrapper() - Global wrapper analysis
GlooDebugHelper.testCanvasRender() - Test if canvas is animating
GlooDebugHelper.captureFrame()     - Download current frame
GlooDebugHelper.enableDebugMode()  - Add ?glooDebug=1 to URL
GlooDebugHelper.disableDebugMode() - Remove debug param
GlooDebugHelper.emergencyFix()     - Apply visibility fixes
GlooDebugHelper.revertEmergencyFix() - Undo emergency fixes
GlooDebugHelper.fullDiagnostic()   - Run all diagnostics
GlooDebugHelper.help()             - Show this help

Quick Start:
-----------
1. GlooDebugHelper.healthCheck()   - Start here
2. GlooDebugHelper.enableDebugMode() - If you need high-contrast colors
3. GlooDebugHelper.emergencyFix()  - If nothing else works

Tips:
----
• Debug mode adds red/green/blue high-contrast palette
• Emergency fix temporarily boosts visibility
• Capture frames to verify WebGL is rendering
• Check browser WebGL support at chrome://gpu/
      `);
    }
  };

  // Make it globally available
  window.GlooDebugHelper = GlooDebugHelper;

  // Auto-run basic check if Gloo elements are present
  if (document.querySelector('[data-gloo-global]')) {
    console.log('🎭 Gloo Debug Helper loaded! Try GlooDebugHelper.help()');

    // Show quick status
    setTimeout(() => {
      const canvas = document.querySelector('[data-testid="gloo-canvas"]');
      const isDebugMode = new URLSearchParams(window.location.search).has('glooDebug');

      if (!canvas) {
        console.warn('⚠️ Gloo canvas not found. Run GlooDebugHelper.healthCheck()');
      } else if (isDebugMode) {
        console.log('🔍 Debug mode active - high contrast palette should be visible');
      }
    }, 1000);
  }

})();
