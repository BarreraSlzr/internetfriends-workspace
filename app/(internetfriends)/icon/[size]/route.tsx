import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const size = parseInt((await params).size, 10)

  return new ImageResponse(
    (
      <div
        style={{
          _background: 'linear-gradient(90deg, #FF7E29 0%, #FF486C 100%)',
          _borderRadius: '8px',
          width: '100%',
          height: '100%',
          _display: 'flex',
          _alignItems: 'center',
          _justifyContent: 'center',
          _fontSize: `${size / 2}px`,
          _fontWeight: 'bolder',
          _color: 'white',
        }}
      >
        @
      </div>
    ),
    {
      width: size,
      height: size,
    }
  )
}