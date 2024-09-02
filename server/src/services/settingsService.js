const prisma = require("../prisma");

class SettingsService {
  async getSettings() {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await this.createDefaultSettings();
    }
    return settings;
  }

  async updateSettings(updateData) {
    // Assurez-vous d'obtenir l'ID actuel des paramètres
    const currentSettings = await this.getSettings();

    // Filtrer les champs non modifiables ou non présents dans `updateData`
    const { id, createdAt, updatedAt, ...data } = updateData;

    return prisma.settings.update({
      where: { id: currentSettings.id },
      data: data,
    });
  }

  async createDefaultSettings() {
    return prisma.settings.create({
      data: {
        storeName: "Default Store",
        currency: "USD",
        timezone: "UTC",
        lowStockThreshold: 10,
        vatRate: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}

module.exports = new SettingsService();
