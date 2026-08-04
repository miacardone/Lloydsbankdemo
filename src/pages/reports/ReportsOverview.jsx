import { PageHeader } from '@/components/layout/PageHeader';
import { ChartCard } from '@/components/charts/ChartCard';
import { Bars, DonutStat, TrendArea } from '@/components/charts/Charts';
import { Select } from '@/components/ui/Field';
import { DATE_RANGES } from '@/config/app';
import { CARD_BRAND_COLORS } from '@/data/reference';
import {
  chargebackRatioByWeek,
  chargebacksByAmountBand,
  chargebacksByCardType,
  chargebacksByReasonCode,
  chargebacksByTransactionMonth,
  spanBetweenTransactionAndPost,
} from '@/data/chargebacks';
import { formatMonth, formatShortDate } from '@/lib/format';

export function ReportsOverview() {
  const topReason = chargebacksByReasonCode[0];
  const topCard = chargebacksByCardType[0];

  return (
    <>
      <PageHeader
        title="Reports"
        description="The standing view of dispute performance. Every panel filters off the same date range."
        actions={
          <>
            <Select aria-label="MIDs" className="w-36" options={['All MIDs', 'Grouped']} />
            <Select
              aria-label="Currency"
              className="w-44"
              options={['All currencies', 'USD', 'EUR']}
            />
            <Select
              aria-label="Date range"
              className="w-44"
              options={DATE_RANGES}
              defaultValue="Last 90 days"
            />
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Chargebacks by reason code (top 5)" height={250}>
          <DonutStat
            data={chargebacksByReasonCode}
            headline={`${topReason.share}%`}
            subline={topReason.name}
          />
        </ChartCard>
        <ChartCard title="Card type" height={250}>
          <DonutStat
            data={chargebacksByCardType}
            headline={`${topCard.share}%`}
            subline={topCard.name}
            colors={CARD_BRAND_COLORS}
          />
        </ChartCard>
        <ChartCard
          title="Chargebacks by amount band"
          height={250}
          note="Higher-value disputes are worth defending first."
        >
          <Bars data={chargebacksByAmountBand} xKey="band" yKey="value" formatY={(v) => `${v}%`} />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Chargebacks by transaction month" height={230}>
          <TrendArea
            data={chargebacksByTransactionMonth}
            xKey="month"
            yKey="share"
            name="Share"
            formatX={formatMonth}
            formatY={(v) => `${v}%`}
            gradientId="pmMonthArea"
          />
        </ChartCard>
        <ChartCard
          title="Days between transaction and post date"
          height={230}
          note="A widening gap means issuers are filing later, which shortens your response window."
        >
          <TrendArea
            data={spanBetweenTransactionAndPost}
            xKey="week"
            yKey="days"
            name="Days"
            formatX={formatShortDate}
            gradientId="pmSpanArea"
          />
        </ChartCard>
      </div>

      <div className="mt-4">
        <ChartCard
          title="Chargeback transaction ratio by week"
          height={230}
          note="Visa places accounts in monitoring above 0.9%. Stay under it."
        >
          <TrendArea
            data={chargebackRatioByWeek}
            xKey="week"
            yKey="ratio"
            name="Ratio"
            formatX={formatShortDate}
            formatY={(v) => `${v}%`}
            gradientId="pmRatioArea"
          />
        </ChartCard>
      </div>
    </>
  );
}

export default ReportsOverview;
