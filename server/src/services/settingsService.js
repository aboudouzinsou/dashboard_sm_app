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
    const currentSettings = await this.getSettings();
    return prisma.settings.update({
      where: { id: currentSettings.id },
      data: updateData,
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
      },
    });
  }
}

module.exports = new SettingsService();
