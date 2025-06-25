/*
  Warnings:

  - A unique constraint covering the columns `[name,city,state]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Store_name_city_state_key" ON "Store"("name", "city", "state");
