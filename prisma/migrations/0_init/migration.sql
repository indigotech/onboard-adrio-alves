-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "password" VARCHAR,
    "birthdate" TIMESTAMP(6),

    CONSTRAINT "user_pk" PRIMARY KEY ("id")
);

