import antediluvianSecrets from '/src/mock-database/releases/antediluvian-secrets.json'
import sacredEastUpdate    from '/src/mock-database/releases/2013-release.json'
import oldEbonheart        from '/src/mock-database/releases/old-ebonheart.json'
import sacredEast          from '/src/mock-database/releases/sacred-east.json'
import aanthirrin          from '/src/mock-database/releases/aanthirin.json'
import telvannis           from '/src/mock-database/releases/telvannis.json'

import vvardenfell         from '/src/mock-database/bethesda-releases/vanilla.json'
import solstheim           from '/src/mock-database/bethesda-releases/bloodmoon.json'
import firemoth            from '/src/mock-database/bethesda-releases/firemoth.json'

import generateMapSnapshot from '/src/utils/generate-map-snapshot.ts'

export default {
  getSnapshot(datetime) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(generateMapSnapshot([
          vvardenfell,
          firemoth,
          solstheim,
          telvannis,
          antediluvianSecrets,
          sacredEast,
          sacredEastUpdate,
          aanthirrin,
          oldEbonheart
        ], datetime));
      }, 3000);
    });
  }
}
