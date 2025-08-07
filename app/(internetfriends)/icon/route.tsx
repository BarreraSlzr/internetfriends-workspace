import { ImageResponse } from 'next/og'

export async function GET() {
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
          _fontSize: '16px',
          _fontWeight: 'bolder',
          _color: 'white',
        }}
      >
        @
      </div>
    ),
    {
      width: 32,
      height: 32,
    }
  )
}

