<template>
  <div>
    <h3 v-if="claims.length > 0">{{ claimTypeString }} Claims</h3>
    <ul>
      <li v-for="claim in claims"><b>{{ getClaimStatus(claim) }}</b> <a :href="claim.url" target="_blank">{{ claim.name }} </a></li>
    </ul>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue'
  import { CellXY }          from 'morromapper-logic'

  import ClaimType from '/src/types/claim-type.ts'

  import statusForClaim from '/src/utils/status-for-claim.ts'

  export default defineComponent({
    props: {
      claims: {
        type: Array,//of `Claim`
        required: true
      },
      claimType: {
        type: String,// Of type `ClaimType`
        required: true
      },
      snapshotTime: {
        type: String,//ISO 8601 date
        required: true
      }
    },
    computed: {
      claimTypeString() {
        return {
          [ClaimType.CONCEPT]:  "Concept",
          [ClaimType.ASSET]:    "Asset",
          [ClaimType.EXTERIOR]: "Exterior",
          [ClaimType.INTERIOR]: "Interior",
          [ClaimType.QUEST]:    "Quest"
        }[this.claimType];
      }
    },
    methods: {
      getClaimStatus(claim) {
        return statusForClaim(claim, this.snapshotTime);
      }
    }
  });
</script>
