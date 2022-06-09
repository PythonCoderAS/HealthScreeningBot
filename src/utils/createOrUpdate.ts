import { Model, WhereOptions } from "sequelize";

export default async function createOrUpdate<M extends Model<MT, MCT>, MT, MCT>(
  model,
  newValues: MCT,
  condition: WhereOptions<MCT>
): Promise<M> {
  const record = await model.findOne({ where: condition });
  if (record) {
    await record.update(newValues);
    return record;
  }

  return model.create(newValues);
}
