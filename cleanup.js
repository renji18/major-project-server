const path = require("path")
const fs = require("fs-extra")
const schedule = require("node-schedule")

const tmpFolderPath = path.join(__dirname, "tmp")

const ageThreshold = 60 * 60 * 1000

const cleanTmpFolder = async () => {
  try {
    await fs.ensureDir(tmpFolderPath)
    const files = await fs.readdir(tmpFolderPath)
    if (files.length === 0) return
    const now = Date.now()
    const deletePromises = files.map(async (file) => {
      const filePath = path.join(tmpFolderPath, file)
      const stats = await fs.stat(filePath)
      if (now - stats.mtimeMs > ageThreshold) {
        await fs.unlink(filePath)
      }
    })
    await Promise.all(deletePromises)
    console.log("Temporary files cleaned up successfully")
  } catch (err) {
    console.error("Error cleaning up temporary files:", err)
  }
}

schedule.scheduleJob("0 0 * * *", cleanTmpFolder)

cleanTmpFolder()
