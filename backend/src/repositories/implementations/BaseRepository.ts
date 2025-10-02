import type { FilterQuery, Model } from "mongoose";

export abstract class BaseRepository<T, D> {
	protected model: Model<D>;
	protected entityMapper: (doc: Partial<D>) => T;

	constructor(model: Model<D>, entityMapper: (doc: Partial<D>) => T) {
		this.model = model;
		this.entityMapper = entityMapper;
	}

	async findById(id: string): Promise<T | null> {
		const doc = await this.model.findById(id).lean();
		return doc ? this.entityMapper(doc as D) : null;
	}

	async findAll(filter: FilterQuery<D> = {}, skip = 0, limit = 10): Promise<T[]> {
		const docs = await this.model.find(filter).skip(skip).limit(limit);
		return docs.map(this.entityMapper);
	}

	async save(entity: Partial<D>): Promise<T> {
		const doc = await this.model.create(entity);
		return this.entityMapper(doc.toObject());
	}

	async update(id: string, entity: Partial<D>): Promise<T | null> {
		const doc = await this.model.findByIdAndUpdate(id, entity, { new: true }).lean();
		return doc ? this.entityMapper(doc as D) : null;
	}

	async delete(id: string): Promise<boolean> {
		const result = await this.model.findByIdAndDelete(id);
		return result !== null;
	}
}
