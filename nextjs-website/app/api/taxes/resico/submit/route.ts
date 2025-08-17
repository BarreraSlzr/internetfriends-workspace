import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const SubmitTaxDataSchema = z.object({
  customer_rfc: z.string().optional(),
  customer_name: z.string(),
  customer_email: z.string().email(),
  amount: z.number().positive(),
  amount_mxn: z.number().positive().optional(),
  currency: z.enum(['USD', 'MXN']),
  concept: z.string(),
  payment_method: z.string(),
  payment_reference: z.string(),
  timestamp: z.string().datetime(),
  invoice_required: z.boolean(),
  user_id: z.string(),
  gs_amount: z.number(),
  tier_id: z.string()
})

// Current USD to MXN exchange rate (mock)
const USD_TO_MXN_RATE = 18.50

// Mock Resico integration for demo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = SubmitTaxDataSchema.parse(body)

    // Simulate Resico API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Convert USD to MXN if needed
    const amountMXN = validatedData.currency === 'USD' 
      ? validatedData.amount * USD_TO_MXN_RATE
      : validatedData.amount

    // Mock successful Resico response
    const mockTransactionId = `RESICO_TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const ivaAmount = amountMXN * 0.16
    const retentionAmount = amountMXN >= 2000 ? amountMXN * 0.10 : 0

    const response = {
      resico_transaction_id: mockTransactionId,
      tax_status: 'submitted',
      iva_calculated: ivaAmount,
      retention_applied: retentionAmount,
      invoice_url: `https://resico.mx/invoice/${mockTransactionId}`,
      tax_receipt_url: `https://resico.mx/receipt/${mockTransactionId}`,
      compliance_status: 'submitted',
      submission_date: new Date().toISOString(),
      // Additional info for user
      user_info: {
        invoice_required: validatedData.invoice_required,
        tax_obligations: amountMXN >= 2000 ? [
          'IVA del 16% aplicado',
          'Retención de impuestos aplicada',
          'Factura fiscal generada'
        ] : [
          'IVA del 16% aplicado',
          'Comprobante fiscal generado'
        ],
        next_steps: validatedData.invoice_required ? [
          'Revisa tu factura en el enlace proporcionado',
          'Guarda el comprobante para tus registros contables',
          'El IVA ya está incluido en el monto pagado'
        ] : [
          'Tu comprobante fiscal está listo',
          'No se requieren acciones adicionales'
        ]
      },
      // Demo data
      _demo: true,
      _demo_instructions: 'This is a demo Resico tax submission. In production, this would submit to actual Mexican tax authorities.',
      _calculation_details: {
        original_amount: validatedData.amount,
        original_currency: validatedData.currency,
        amount_mxn: amountMXN,
        exchange_rate: USD_TO_MXN_RATE,
        iva_rate: 0.16,
        retention_rate: amountMXN >= 2000 ? 0.10 : 0
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Resico mock tax submission error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid tax data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to submit tax data to Resico (DEMO MODE)',
        details: error.message,
        compliance_status: 'failed'
      },
      { status: 500 }
    )
  }
}