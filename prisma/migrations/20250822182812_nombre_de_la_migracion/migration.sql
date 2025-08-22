-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "gmail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sensor" (
    "id" SERIAL NOT NULL,
    "sensorID" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "sensorUsername" TEXT NOT NULL,
    "sensorDescripction" TEXT NOT NULL,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reporte" (
    "id" SERIAL NOT NULL,
    "sensorID" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_gmail_key" ON "public"."Usuario"("gmail");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_sensorID_key" ON "public"."Sensor"("sensorID");

-- AddForeignKey
ALTER TABLE "public"."Sensor" ADD CONSTRAINT "Sensor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
