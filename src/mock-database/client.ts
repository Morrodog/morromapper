import antediluvianSecrets from '/src/mock-database/releases/antediluvian-secrets.json'
import sacredEastUpdate    from '/src/mock-database/releases/2013-release.json'
import oldEbonheart        from '/src/mock-database/releases/old-ebonheart.json'
import sacredEast          from '/src/mock-database/releases/sacred-east.json'
import aanthirrin          from '/src/mock-database/releases/aanthirin.json'
import telvannis           from '/src/mock-database/releases/telvannis.json'

import vvardenfell         from '/src/mock-database/bethesda-releases/vanilla.json'
import solstheim           from '/src/mock-database/bethesda-releases/bloodmoon.json'
import firemoth            from '/src/mock-database/bethesda-releases/firemoth.json'

import ro1 from '/src/mock-database/exterior-claims/RO_1.json'
import ro2 from '/src/mock-database/exterior-claims/RO_2.json'
import ro3 from '/src/mock-database/exterior-claims/RO_3.json'
import ro4 from '/src/mock-database/exterior-claims/RO_4.json'


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
          oldEbonheart,
          ro1,
          ro2,
          ro3,
          ro4
        ], datetime));
      }, 3000);
    });
  }
}
