import antediluvianSecrets from '/src/mock-database/antediluvian-secrets.json'
import sacredEastUpdate    from '/src/mock-database/2013-release.json'
import oldEbonheart        from '/src/mock-database/old-ebonheart.json'
import vvardenfell         from '/src/mock-database/vanilla-cells.json'
import sacredEast          from '/src/mock-database/sacred-east.json'
import aanthirrin          from '/src/mock-database/aanthirin.json'
import solstheim           from '/src/mock-database/solstheim-cell.json'
import telvannis           from '/src/mock-database/telvannis.json'
import firemoth            from '/src/mock-database/firemoth.json'

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
