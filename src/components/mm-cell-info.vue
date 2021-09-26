<!-- 
  TODO? Sort claims by ClaimStatus
  TODO Make component for lists of claims
 -->
<template>
  <div>
    <b>{{ cellCoords }}</b> Stage: {{ cellStatus }}
    <mm-cell-info--claim-list v-for="claimsWithType in claimsByType" :claims="claimsWithType.claims" :claim-type="claimsWithType.claimType" :snapshot-time="snapshotTime"/>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue'

  import ClaimType from '/src/types/claim-type.ts'
  import CellXY    from '/src/types/cell-x-y.ts'

  import MMCellInfoClaimList from '/src/components/mm-cell-info--claim-list.vue'

  import statusForCellFromDocuments from '/src/utils/status-for-cell-from-documents.ts'

  export default defineComponent({
    components: {
      'mm-cell-info--claim-list': MMCellInfoClaimList 
    },
    props: {
      cellXY: {
        type: CellXY,
        required: true
      },
      cellDocuments: {
        type: Array,// Of `Document`
        required: true
      },
      snapshotTime: {
        type: String,//ISO 8601 date
        required: true
      }
    },
    computed: {
      cellStatus() {
        return statusForCellFromDocuments(this.cellDocuments, this.snapshotTime);
      },
      claims() {
        return this.cellDocuments.filter((cellDoc) => {
          return cellDoc.type === "CLAIM";
        });
      },
      releases() {
        return this.cellDocuments.filter((cellDoc) => {
          return cellDoc.type === "RELEASE";
        });
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
      interiorClaims() {
        return this.claimsByType[ClaimType.INTERIOR];
      },
      exteriorClaims() {
        return this.claimsByType[ClaimType.EXTERIOR];
      },
      conceptClaims() {
        return this.claimsByType[ClaimType.CONCEPT];
      },
      assetClaims() {
        return this.claimsByType[ClaimType.ASSET];
      },
      questClaims() {
        return this.claimsByType[ClaimType.QUEST];
      },
      cellCoords() {
        return `[${this.cellXY.x}, ${this.cellXY.y}]`;
      }
    }
  });
</script>
