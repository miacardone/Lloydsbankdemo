import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChartCard } from '@/components/charts/ChartCard';
import { Bars, DonutStat, TrendArea } from '@/components/charts/Charts';
import { Select } from '@/components/ui/Field';
import { DATE_RANGES, DEFAULT_RANGE, rangeStart } from '@/config/app';
import { CARD_BRAND_COLORS } from '@/data/reference';
import {
  amountBandSplit,
  cardTypeSplit,
  chargebackRatioByWeek,
  chargebacks,
  chargebacksByTransactionMonth,
  reasonCodeSplit,
  spanBetweenTransactionAndPost,
} from '@/data/chargebacks';
import { TODAY } from '@/data/seed';
import { formatMonth, formatShortDate } from '@/lib/format';

export function ReportsOverview() {
  const [range, setRange] = useState(DEFAULT_RANGE);

  /* One window, every panel. The two decorative selects that used to sit here
     ("All MIDs / Grouped", "All currencies") had nothing behind them — the
     demo ledger settles in one currency and carries no MID grouping — so they
     are gone rather than left looking clickable. */
  const view = useMemo(() => {
    const from = rangeStart(range, TODAY);
    const rows = chargebacks.filter((row) => row.postDate >= from);
    return {
      from,
      count: rows.length,
      reasons: reasonCodeSplit(rows),
      cards: cardTypeSplit(rows),
      bands: amountBandSplit(rows),
      months: chargebacksByTransactionMonth.filter((point) => point.month >= from),
      spans: spanBetweenTransactionAndPost.filter((point) => point.week >= from),
      ratios: chargebackRatioByWeek.filter((point) => point.week >= from),
    };
  }, [range]);

  const topReason = view.reasons[0];
  const topCard = view.cards[0];

  return (
    <>
      <PageHeader
        title="Reports"
        description={`The standing view of dispute performance. Every panel below covers the same window — ${view.count} disputes posted since ${view.from}.`}
        actions={
          <Select
            aria-label="Date range"
            className="w-44"
            options={DATE_RANGES}
            value={range}
            onChange={(event) => setRange(event.target.value)}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Chargebacks by reason code (top 5)" height={250}>
          <DonutStat
            data={view.reasons}
            headline={topReason ? `${topReason.share}%` : '—'}
            subline={topReason?.name ?? 'No disputes in range'}
          />
        </ChartCard>
        <ChartCard title="Card type" height={250}>
          <DonutStat
            data={view.cards}
            headline={topCard ? `${topCard.share}%` : '—'}
            subline={topCard?.name ?? 'No disputes in range'}
            colors={CARD_BRAND_COLORS}
          />
        </ChartCard>
        <ChartCard
          title="Chargebacks by amount band"
          height={250}
          note="Higher-value disputes are worth defending first."
        >
          <Bars data={view.bands} xKey="band" yKey="value" />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Chargebacks by transaction month" height={230}>
          <TrendArea
            data={view.months}
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
            data={view.spans}
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
            data={view.ratios}
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
