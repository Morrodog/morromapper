import antediluvianSecrets         from '/src/mock-database/releases/antediluvian-secrets.json'
import sacredEastUpdate            from '/src/mock-database/releases/2013-release.json'
import oldEbonheart                from '/src/mock-database/releases/old-ebonheart.json'
import sacredEast                  from '/src/mock-database/releases/sacred-east.json'
import aanthirrin                  from '/src/mock-database/releases/aanthirin.json'
import telvannis                   from '/src/mock-database/releases/telvannis.json'
import vvardenfell                 from '/src/mock-database/releases/vanilla.json'
import solstheim                   from '/src/mock-database/releases/bloodmoon.json'
import firemoth                    from '/src/mock-database/releases/firemoth.json'
import imperialTelvannisOverhaul   from '/src/mock-database/releases/imperial-telvannis-overhaul.json'

const releases = [antediluvianSecrets, sacredEastUpdate, oldEbonheart, sacredEast, aanthirrin, telvannis, vvardenfell, solstheim, firemoth, imperialTelvannisOverhaul];


import ro1 from '/src/mock-database/exterior-claims/RO_1.json'
import ro2 from '/src/mock-database/exterior-claims/RO_2.json'
import ro3 from '/src/mock-database/exterior-claims/RO_3.json'
import ro4 from '/src/mock-database/exterior-claims/RO_4.json'

const exteriorClaims = [ro1, ro2, ro3, ro4];

import dreughmora from '/src/mock-database/quest-claims/revenge-of-the-dreughmora.json'
import liberty    from '/src/mock-database/quest-claims/given-death-not-liberty.json'
import missing    from '/src/mock-database/quest-claims/the-missing-pot.json'
import davis      from '/src/mock-database/quest-claims/a-long-vacation-for-davis.json'

const questClaims = [dreughmora, liberty, missing, davis];

import interior1 from '/src/mock-database/interior-claims/ald-duhg-0.json'
import interior2 from '/src/mock-database/interior-claims/ald-duhg-1.json'
import interior3 from '/src/mock-database/interior-claims/ald-duhg-10.json'
import interior4 from '/src/mock-database/interior-claims/ald-duhg-11.json'
import interior5 from '/src/mock-database/interior-claims/ald-duhg-12.json'
import interior6 from '/src/mock-database/interior-claims/ald-duhg-13.json'
import interior7 from '/src/mock-database/interior-claims/ald-duhg-14.json'
import interior8 from '/src/mock-database/interior-claims/ald-duhg-15.json'
import interior9 from '/src/mock-database/interior-claims/ald-duhg-2.json'
import interior10 from '/src/mock-database/interior-claims/ald-duhg-3.json'
import interior11 from '/src/mock-database/interior-claims/ald-duhg-4.json'
import interior12 from '/src/mock-database/interior-claims/ald-duhg-5.json'
import interior13 from '/src/mock-database/interior-claims/ald-duhg-6.json'
import interior14 from '/src/mock-database/interior-claims/ald-duhg-7.json'
import interior15 from '/src/mock-database/interior-claims/ald-duhg-8.json'
import interior16 from '/src/mock-database/interior-claims/ald-duhg-9.json'
import interior17 from '/src/mock-database/interior-claims/dogdan-grotto.json'
import interior18 from '/src/mock-database/interior-claims/doggith-mora-1.json'
import interior19 from '/src/mock-database/interior-claims/doggith-mora-2.json'
import interior20 from '/src/mock-database/interior-claims/doggith-mora-3.json'
import interior21 from '/src/mock-database/interior-claims/fort-dogmoth-0.json'
import interior22 from '/src/mock-database/interior-claims/fort-dogmoth-1.json'
import interior23 from '/src/mock-database/interior-claims/fort-dogmoth-10.json'
import interior24 from '/src/mock-database/interior-claims/fort-dogmoth-2.json'
import interior25 from '/src/mock-database/interior-claims/fort-dogmoth-3.json'
import interior26 from '/src/mock-database/interior-claims/fort-dogmoth-4.json'
import interior27 from '/src/mock-database/interior-claims/fort-dogmoth-5.json'
import interior28 from '/src/mock-database/interior-claims/fort-dogmoth-6.json'
import interior29 from '/src/mock-database/interior-claims/fort-dogmoth-7.json'
import interior30 from '/src/mock-database/interior-claims/fort-dogmoth-8.json'
import interior31 from '/src/mock-database/interior-claims/fort-dogmoth-9.json'
import interior32 from '/src/mock-database/interior-claims/sea-tunnel.json'
import interior33 from '/src/mock-database/interior-claims/shashlyk-1.json'
import interior34 from '/src/mock-database/interior-claims/shashlyk-2.json'
import interior35 from '/src/mock-database/interior-claims/shashlyk-3.json'
import interior36 from '/src/mock-database/interior-claims/shipwreck-1.json'
import interior37 from '/src/mock-database/interior-claims/shipwreck-2.json'

const interiorClaims = [ interior1, interior2, interior3, interior4, interior5 , interior6 , interior7 , interior8 , interior9 , interior10, interior11, interior12, interior13, interior14, interior15, interior16, interior17, interior18, interior19, interior20, interior21, interior22, interior23, interior24, interior25, interior26, interior27, interior28, interior29, interior30, interior31, interior32, interior33, interior34, interior35, interior36, interior37];

import generateMapSnapshot from '/src/utils/generate-map-snapshot.ts'

const documentsById = {
  ...(Object.fromEntries((interiorClaims.concat(exteriorClaims).concat(questClaims).concat(releases)).map((claim) => {
    return [claim.id, claim];
  }))),
};

export default {
  getSnapshot(datetime) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(generateMapSnapshot([
          ...releases,
          ...exteriorClaims,
          ...questClaims,
          ...interiorClaims
        ], datetime));
      }, 1);
    });
  },
  getDocuments(documentIds) {
    return Promise.resolve(documentIds.map((id) => {
      return documentsById[id];
    }));
  }
}
