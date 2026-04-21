<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import { formatStatCount } from "@/utils/stats";

export let className = "";
export let style = "";
export let initialPostCount = 0;
export let initialTotalWords = 0;
export let initialVisits = 0;
export let initialPageviews = 0;

let isExpanded = true;
let postCount = initialPostCount;
let totalWords = initialTotalWords;
let visits = initialVisits;
let pageviews = initialPageviews;

type StatTile = {
	icon: string;
	label: string;
	getValue: () => string;
};

const statsTiles: StatTile[] = [
	{
		icon: "material-symbols:person-outline",
		label: "访问量",
		getValue: () => formatStatCount(visits),
	},
	{
		icon: "material-symbols:visibility-outline",
		label: "阅读量",
		getValue: () => formatStatCount(pageviews),
	},
];

async function loadSiteStats() {
	try {
		const response = await fetch("/api/stats/site.json", {
			cache: "no-store",
			headers: {
				accept: "application/json",
			},
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();

		return {
			visits: Number(data.visits) || 0,
			pageviews: Number(data.pageviews) || 0,
		};
	} catch {
		// Keep the default placeholder values when stats are unavailable.
		return null;
	}
}

onMount(async () => {
	const siteStats = await loadSiteStats();

	if (siteStats) {
		visits = siteStats.visits;
		pageviews = siteStats.pageviews;
	}
});

function toggleExpand() {
	isExpanded = !isExpanded;
}
</script>

<div class={`card-base p-3 ${className}`} {style}>
  <div class="flex justify-between items-center cursor-pointer mb-3" on:click={toggleExpand}>
    <h3 class="font-bold text-lg transition">统计信息</h3>
    <Icon
      icon={isExpanded ? 'material-symbols:expand-less' : 'material-symbols:expand-more'}
      class="text-[1.5rem] transition"
    />
  </div>

  {#if isExpanded}
    <div class="grid grid-cols-2 gap-2.5 mb-3">
      <div class="text-center rounded-xl bg-[var(--btn-regular-bg)] py-2.5">
        <div class="flex items-center justify-center gap-1 text-50 text-[0.7rem] mb-0.5">
          <Icon icon="material-symbols:article-outline-rounded" class="text-sm"></Icon>
          <span>文章数</span>
        </div>
        <div class="text-base font-bold text-90">{postCount}</div>
      </div>

      <div class="text-center rounded-xl bg-[var(--btn-regular-bg)] py-2.5">
        <div class="flex items-center justify-center gap-1 text-50 text-[0.7rem] mb-0.5">
          <Icon icon="material-symbols:notes-rounded" class="text-sm"></Icon>
          <span>总字数</span>
        </div>
        <div class="text-base font-bold text-90">{formatStatCount(totalWords)}</div>
      </div>
    </div>

    <div class="border-t border-dashed border-black/10 dark:border-white/[0.15] pt-3">
      <div class="grid grid-cols-2 gap-2.5">
        {#each statsTiles as tile}
          <div class="text-center rounded-xl bg-[var(--btn-regular-bg)] py-2.5">
            <div class="flex items-center justify-center gap-1 text-50 text-[0.7rem] mb-0.5">
              <Icon icon={tile.icon} class="text-sm"></Icon>
              <span>{tile.label}</span>
            </div>
            <div class="text-base font-bold text-90">{tile.getValue()}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
