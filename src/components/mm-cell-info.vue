<!-- 
  TODO? Sort claims by ClaimStatus
  TODO Make component for lists of claims
 -->
<template>
  <template v-if="loadingDocuments">
    <template v-if="hasClaims && !hasReleases">
      Loading claims...
    </template>
    <template v-if="hasReleases && !hasClaims">
      Loading release information...
    </template>
    <template v-if="hasReleases && hasClaims">
      Loading claims and releases...
    </template>
  </template>
  <div v-else>
    <b>{{ cellCoords }}</b> Stage: {{ cellStatus }}
    <!-- TODO: Releases -->
    <mm-cell-info--claim-list v-for="claimsWithType in claimsByType" :claims="claimsWithType.claims" :claim-type="claimsWithType.claimType" :snapshot-time="snapshotTime" />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue'

  import ClaimType from '/src/types/claim-type.ts'
  import CellXY    from '/src/types/cell-x-y.ts'

  import MMCellInfoClaimList from '/src/components/mm-cell-info--claim-list.vue'

  import statusForCellFromDocuments from '/src/utils/status-for-cell-from-documents.ts'

  import mockDbClient from '/src/mock-database/client.ts'

  export default defineComponent({
    components: {
      'mm-cell-info--claim-list': MMCellInfoClaimList 
    },
    props: {
      cell: {
        type: CellXY,
        required: true
      },
      mapSnapshot: {
        type: Object, // Of `MapSnapshot` interface
        required: true
      },
      snapshotTime: {
        type: String,//ISO 8601 date
        required: true
      }
    },
    data() {
      return {
        cellDocuments: [],
        loadingDocuments: true
      };
    },
    computed: {
      claims() {
        return this.cellDocuments.filter((doc) => {
          return doc.type === "CLAIM";
        });
      },
      releases() {
        return this.cellDocuments.filter((doc) => {
          return doc.type === "RELEASE";
        });
      },
      hasClaims() {
        const cellKey = CellXY.toObjectKey(this.cell);
        if(!this.mapSnapshot.cellClaims.hasOwnProperty(cellKey)) return false;
        return this.mapSnapshot.cellClaims[cellKey].length > 0;
      },
      hasReleases() {
        const cellKey = CellXY.toObjectKey(this.cell);
        if(!this.mapSnapshot.cellReleases.hasOwnProperty(cellKey)) return false;
        return this.mapSnapshot.cellReleases[cellKey].length > 0;
      },
      cellDocumentsPromise() {
        const cellKey = CellXY.toObjectKey(this.cell);
        return mockDbClient.getDocuments(this.mapSnapshot.cellClaims[cellKey].concat(this.mapSnapshot.cellReleases[cellKey]));
      },
      cellStatus() {
        return statusForCellFromDocuments(this.cellDocuments, this.snapshotTime);
      },
      // TODO: Rename and generally clean up
      claimsByType() {
        return Object.entries(this.claims.reduce((claimsByType, claim) => {
          claimsByType[claim.claimType].push(claim);
          return claimsByType;
        }, {
          [ClaimType.CONCEPT]:  [],
          [ClaimType.ASSET]:    [],
          [ClaimType.EXTERIOR]: [],
          [ClaimType.INTERIOR]: [],
          [ClaimType.QUEST]:    []
        })).reduce((claimsByType, entry) => {
          claimsByType.push({
            claimType: entry[0],
            claims: entry[1]
          });
          return claimsByType;
        }, []);
      },
      cellCoords() {
        return `[${this.cell.x}, ${this.cell.y}]`;
      }
    },
    watch: {
      cellDocumentsPromise: {
        immediate: true,
        handler(newVal) {
          this.loadingDocuments = true;
          newVal.then((documents) => {
            this.cellDocuments = documents;
            this.loadingDocuments = false;
          });
        }
      }
    }
  });
</script>
