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
import { DiscordAPIError, GuildMember } from "discord.js";
import { Config } from "../orm";
import HealthScreeningBotClient from "./extraClient";

export default async function assignAutoSchoolRole(
  client: HealthScreeningBotClient
): Promise<void> {
  const data = {
    "bxscience.edu": "893918744437456916",
    "bths.edu": "893918912188661850",
    "stuy.edu": "893918994216681473",
  };
  const items = await Config.findAll();
  const guild = client.guilds.cache.get("889983763994521610");
  let suffix: string, roleId: string, member: GuildMember;
  for (const item of items) {
    for (const suffix_data of Object.entries(data)) {
      suffix = suffix_data[0];
      roleId = suffix_data[1];
      if (item.email.endsWith(suffix)) {
        try {
          member = await guild.members.fetch(item.userId);
        } catch (e) {
          if (e instanceof DiscordAPIError) {
            continue;
          }
          console.error(e);
        }
        try {
          await member.roles.add(roleId, "Autorole on email in storage");
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
}
