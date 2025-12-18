import { Injectable } from '@nestjs/common'
import { SpaceMember } from 'src/domain/entities/space-member.entity'
import { DomainError } from 'src/domain/errors/domain-error'

@Injectable()
export class EntryRequestDecisionService {
  decide({
    actor,
    target,
    decision
  }: {
    actor: SpaceMember
    target: SpaceMember
    decision: 'approved' | 'rejected'
  }) {
    if (!actor.isOwner()) {
      throw new DomainError({
        type: 'forbidden',
        message: 'Only owners can approve or reject entry requests.',
        code: 'forbidden-action'
      })
    }
    target.applyEntryDecision(decision)
    return target
  }
}
