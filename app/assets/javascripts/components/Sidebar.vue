<template>
  <div>
    <template v-if="hasAnyPrimaryLeaveOrSharedLeaveEligibility">
      <h2 class="govuk-heading-m">
        Your leave
      </h2>
      <p v-if="hasPrimaryLeaveAndSharedLeaveEligibility">
        You can split a total of <span v-html="formatWeeks(52)"></span> as {{ primaryInitialLeaveOrSharedParentalLeave }}.
      </p>
      <p>
        You’ve taken <span v-html="weeksOfPrimaryInitialLeaveAndSharedLeaveTaken"></span>.
        You have <span v-html="formatWeeks(sharedLeaveRemaining, 'leave')"></span> left.
      </p>
      <div class="govuk-error-summary govuk-!-padding-2 govuk-!-margin-bottom-4" role="alert" tabindex="-1"
        v-if="sharedLeaveRemaining < 0">
        <div class="govuk-error-summary__body">
          You’ve taken too many leave weeks. Unselect <span v-html="formatWeeks(-sharedLeaveRemaining, 'leave')"></span>.
        </div>
      </div>
      <div class="govuk-error-summary govuk-!-padding-2 govuk-!-margin-bottom-4" role="alert" tabindex="-1"
        v-if="hasAdoptionLeaveError">
        <div class="govuk-error-summary__body" v-if="isOverseasAdoption">
          You must take at least 2 weeks of Adoption Leave or Pay and
          it must start within the first 28 days of the child arriving in the UK.
        </div>
        <div class="govuk-error-summary__body" v-else>
          You must take at least 2 weeks of Adoption Leave or Pay and it must include the first week the child lives with you.
        </div>
      </div>
    </template>
    <template v-if="hasAnyPrimaryLeaveOrSharedPayEligibility">
      <h2 class="govuk-heading-m">
        Your pay
      </h2>
      <p>
        You can {{ hasPrimaryLeaveAndSharedPayEligibility ? "split a total of" : "take" }} <span v-html="formatWeeks(39)"></span> of {{ primaryInitialPayOrSharedParentalPay }}.
      </p>
      <p>
        You’ve taken <span v-html="formatWeeks(payUsed)"></span> of pay.
        You have <span v-html="formatWeeks(payRemaining)"></span> of pay left.
      </p>
      <div class="govuk-error-summary govuk-!-padding-2 govuk-!-margin-bottom-4" role="alert" tabindex="-1"
        v-if="payRemaining < 0">
        <div class="govuk-error-summary__body">
          You’ve taken too many paid weeks. Untick <span v-html="formatWeeks(-payRemaining, 'paid')"></span>.
        </div>
      </div>
    </template>
    <template v-if="hasPaternityLeaveOrPayEligibility">
      <h2 class="govuk-heading-m">
        Paternity {{ paternityLeaveAndOrPay }}
      </h2>
      <p>
        The partner has <span v-html="formatWeeks(eligibility.secondary.statutoryLeave ? paternityLeaveRemaining : paternityPayRemaining)"></span> left to take as
        Paternity {{ paternityLeaveAndOrPay }}.
      </p>
      <div class="govuk-error-summary govuk-!-padding-2 govuk-!-margin-bottom-4" role="alert" tabindex="-1"
        v-if="paternityLeaveRemaining < 0">
        <div class="govuk-error-summary__body">
          You’ve taken too many weeks of Paternity Leave. Unselect <span v-html="formatWeeks(-paternityLeaveRemaining, 'Paternity Leave')"></span>.
        </div>
      </div>
      <div class="govuk-error-summary govuk-!-padding-2 govuk-!-margin-bottom-4" role="alert" tabindex="-1"
        v-if="!eligibility.secondary.statutoryLeave && paternityPayRemaining < 0">
        <div class="govuk-error-summary__body">
          You’ve taken too many weeks of Paternity Pay. Untick <span v-html="formatWeeks(-paternityPayRemaining, 'Paternity Pay')"></span>.
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  module.exports = {
    data: () => ({
      leaveWeeks: {
        primary: { nonSpl: 0, spl: 0, shppCountedAsSpl: 0 },
        secondary: { nonSpl: 0, spl: 0, shppCountedAsSpl: 0 }
      },
      shppAndPrimaryInitialPayWeeks: 0,
      paternityPayWeeks: 0
    }),
    props: {
      weeks: Array,
      natureOfParenthood: String,
      typeOfAdoption: String,
      primaryLeaveType: String,
      names: Object,
      eligibility: Object,
      reset: Function
    },
    computed: {
      primaryLeaveUsed: function () {
        return this.leaveWeeks.primary.nonSpl
      },
      splUsed: function () {
        return this.leaveWeeks.primary.spl + this.leaveWeeks.secondary.spl
      },
      shppCountedAsSpl: function () {
        return this.leaveWeeks.primary.shppCountedAsSpl + this.leaveWeeks.secondary.shppCountedAsSpl
      },
      sharedLeaveRemaining: function () {
        const leaveBalanceUsed = this.primaryLeaveUsed + this.splUsed + this.shppCountedAsSpl
        return 52 - leaveBalanceUsed
      },
      payUsed: function () {
        return this.shppAndPrimaryInitialPayWeeks
      },
      payRemaining: function () {
        return 39 - this.payUsed
      },
      paternityLeaveUsed: function () {
        return this.leaveWeeks.secondary.nonSpl
      },
      paternityLeaveRemaining: function () {
        return 2 - this.paternityLeaveUsed
      },
      paternityPayRemaining: function () {
        return 2 - this.paternityPayWeeks
      },
      hasAdoptionLeaveError: function () {
        if (this.primaryLeaveType !== 'adoption') {
          return false
        }
        if (this.primaryLeaveUsed + this.leaveWeeks.primary.shppCountedAsSpl < 2) {
          return true
        }
        if (this.isOverseasAdoption) {
          const firstAdoptionLeaveWeek = this.weeks.find(week => week.primary.leave.text === this.primaryLeaveType)
          return !firstAdoptionLeaveWeek || firstAdoptionLeaveWeek.number > 3
        } else {
          const zeroWeek = this.weeks.find(week => week.number === 0)
          return zeroWeek.primary.leave.text !== this.primaryLeaveType
        }
      },
      isOverseasAdoption: function () {
        return (this.natureOfParenthood === 'adoption') && (this.typeOfAdoption === 'overseas')
      },
      hasAnySharedLeaveEligibility: function () {
        return this.eligibility.primary.spl || this.eligibility.secondary.spl
      },
      hasAnySharedPayEligibility: function () {
        return this.eligibility.primary.shpp || this.eligibility.secondary.shpp
      },
      hasAnyPrimaryLeaveOrSharedLeaveEligibility: function () {
        return this.eligibility.primary.statutoryLeave || this.hasAnySharedLeaveEligibility
      },
      hasPrimaryLeaveAndSharedLeaveEligibility: function () {
        return this.eligibility.primary.statutoryLeave && this.hasAnySharedLeaveEligibility
      },
      hasAnyPrimaryLeaveOrSharedPayEligibility: function () {
        return this.eligibility.primary.statutoryPay || this.hasAnySharedPayEligibility
      },
      hasPrimaryLeaveAndSharedPayEligibility: function () {
        return this.eligibility.primary.statutoryPay && this.hasAnySharedPayEligibility
      },
      hasPaternityLeaveOrPayEligibility: function () {
        return this.eligibility.secondary.statutoryLeave || this.eligibility.secondary.statutoryPay
      },
      primaryInitialLeaveOrSharedParentalLeave: function () {
        const primaryLeave = this.eligibility.primary.statutoryLeave ?
          `${this.capitalize(this.primaryLeaveType)} Leave` : undefined
        const sharedLeave = this.hasAnySharedLeaveEligibility ? `Shared Parental Leave` : undefined
        return [primaryLeave, sharedLeave].filter(leave => !!leave).join(' or ')
      },
      primaryInitialPayOrSharedParentalPay: function () {
        return [`Statutory ${this.capitalize(this.primaryLeaveType)} Pay`, 'Shared Parental Pay'].join(' or ')
      },
      weeksOfPrimaryInitialLeaveAndSharedLeaveTaken: function () {
        const primaryLeave = this.eligibility.primary.statutoryLeave ?
          `${this.formatWeeks(this.primaryLeaveUsed)} as ${this.capitalize(this.primaryLeaveType)} Leave` :
          undefined
        const sharedLeave = this.hasAnySharedLeaveEligibility ?
          `${this.formatWeeks(this.splUsed)} as Shared Parental Leave` :
          undefined
        return [primaryLeave, sharedLeave].filter(leave => !!leave).join(' and ')
      },
      paternityLeaveAndOrPay: function () {
        const leave = this.eligibility.secondary.statutoryLeave ? "Leave" : null
        const pay = this.eligibility.secondary.statutoryPay ? "Pay" : false
        return [leave, pay].filter(policy => !!policy).join(' and ')
      }
    },
    watch: {
      weeks: {
        immediate: true,
        handler: function (val) {
          this.resetTotals()
          for (let week of val) {
            this.updateTotalsForParent('primary', week)
            this.updateTotalsForParent('secondary', week)
          }
        }
      }
    },
    methods: {
      capitalize: function (value) {
        return this.$options.filters.capitalize(value)
      },
      formatWeeks: function (number, weekType) {
        number = Math.max(number, 0)
        return '<strong>' + number + '</strong> ' + (weekType ? `${weekType} ` : '') + (number === 1 ? 'week' : 'weeks')
      },
      resetTotals: function () {
        this.leaveWeeks = {
          primary: { nonSpl: 0, spl: 0, shppCountedAsSpl: 0 },
          secondary: { nonSpl: 0, spl: 0, shppCountedAsSpl: 0 }
        }
        this.shppAndPrimaryInitialPayWeeks = 0
        this.paternityPayWeeks = 0
      },
      updateTotalsForParent: function (parent, week) {
        const isSpl = week[parent].leave.text === 'shared'

        if (week[parent].leave.text && week[parent].leave.eligible) {
          if (isSpl) {
            this.leaveWeeks[parent].spl++
          } else {
            this.leaveWeeks[parent].nonSpl++
          }
        }

        if (week[parent].pay.text && week[parent].pay.eligible) {
          const isPaternity = !isSpl && (parent === 'secondary')

          if (isPaternity) {
            this.paternityPayWeeks++
          } else {
            this.shppAndPrimaryInitialPayWeeks++

            if (!week[parent].leave.eligible) {
              this.leaveWeeks[parent].shppCountedAsSpl++
            }
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "node_modules/govuk-frontend/dist/govuk/settings/colours-applied";

  .govuk-error-summary__body {
    color: $govuk-error-colour;
    font-weight: bold;
  }
</style>
