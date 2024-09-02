const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const suppliers = [
    {
      name: "Tech Components Inc.",
      contactInfo: {
        email: "contact@techcomp.com",
        phone: "+1 234 567 8900",
        address: "123 Tech Street, Silicon Valley, CA 94000",
      },
    },
    {
      name: "Global Electronics Ltd.",
      contactInfo: {
        email: "info@globalelectronics.com",
        phone: "+44 20 1234 5678",
        address: "456 Electronics Ave, London, UK EC1A 1BB",
      },
    },
    {
      name: "Innovative Gadgets Co.",
      contactInfo: {
        email: "sales@innovativegadgets.com",
        phone: "+81 3 1234 5678",
        address: "789 Innovation Road, Tokyo, Japan 100-0001",
      },
    },
    {
      name: "Eco-Friendly Solutions",
      contactInfo: {
        email: "support@ecofriendly.com",
        phone: "+49 30 1234 5678",
        address: "101 Green Street, Berlin, Germany 10115",
      },
    },
    {
      name: "Smart Home Systems",
      contactInfo: {
        email: "info@smarthomesys.com",
        phone: "+1 415 123 4567",
        address: "202 IoT Boulevard, San Francisco, CA 94105",
      },
    },
  ];

  for (const supplier of suppliers) {
    await prisma.supplier.create({
      data: {
        name: supplier.name,
        contactInfo: supplier.contactInfo,
      },
    });
  }

  console.log("Seed data inserted successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
