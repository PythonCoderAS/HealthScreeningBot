/**
 * Copyright (C) 2021 PythonCoderAS
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { DataTypes, Model, Optional, Sequelize } from "sequelize";

import { database } from "../config";
export const sequelize: Sequelize = new Sequelize(database);

interface ConfigAttributes {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  vaccinated: boolean;
  timeHours: number;
  timeMinutes: number;
  device: string;
}

type ConfigCreationAttributes = Optional<
  ConfigAttributes,
  "vaccinated" | "timeHours" | "timeMinutes" | "device"
>;

export class Config
  extends Model<ConfigAttributes, ConfigCreationAttributes>
  implements ConfigAttributes
{
  public userId!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public vaccinated!: boolean;
  public timeHours!: number;
  public timeMinutes!: number;
  public device!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Config.init(
  {
    // Model attributes are defined here
    userId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vaccinated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    timeHours: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 5,
    },
    timeMinutes: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 40,
    },
    device: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "iPhone 11",
    },
  },
  { sequelize }
);

export async function init(): Promise<void> {
  await sequelize.sync({ alter: true });
}
