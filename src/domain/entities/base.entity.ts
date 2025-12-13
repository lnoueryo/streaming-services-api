export class BaseEntity {
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(params: { createdAt?: Date; updatedAt?: Date }) {
    this.createdAt = params.createdAt ?? new Date()
    this.updatedAt = params.updatedAt ?? new Date()
  }
}
