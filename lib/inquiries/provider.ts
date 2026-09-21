export type ProviderHandoffState =
  | "pending"
  | "attempted"
  | "accepted_by_provider"
  | "confirmed_delivered"
  | "failed"

export type VerifiedProviderEvent = {
  provider: string
  projectMappingKey: string
  sourceEventKey: string
  occurredAt: string
  state: ProviderHandoffState
  attemptId: string | null
  evidence: Record<string, unknown>
}

// A provider adapter must authenticate and normalize an event into this shape.
// No adapter or public callback route is registered until Mountline has the
// provider's actual authentication, mapping, and delivery-evidence contract.
export interface InquiryProviderAdapter {
  verifyAndParse(request: Request): Promise<VerifiedProviderEvent>
}
