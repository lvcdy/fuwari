<script lang="ts">
  import Icon from '@iconify/svelte';
  import { onMount } from 'svelte';

  export let className = '';
  export let style = '';

  let isExpanded = true;
  let postCount = 0;
  let totalWords = 0;

  onMount(async () => {
    const { getSortedPosts } = await import('@/utils/content-utils');
    const { countWords } = await import('@/utils/text-utils');

    const posts = await getSortedPosts();
    postCount = posts.length;
    totalWords = posts.reduce((sum, post) => sum + countWords(post.body || ''), 0);
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
        <div class="text-base font-bold text-90">{totalWords.toLocaleString()}</div>
      </div>
    </div>

    <div class="border-t border-dashed border-black/10 dark:border-white/[0.15] pt-3">
      <iframe
        src="/api/stats/site.json"
        class="hidden"
        on:load={() => {
          const statsElement = document.getElementById('site-stats');
          if (statsElement) {
            fetch('/api/stats/site.json')
              .then(response => response.json())
              .then(data => {
                const visitsElement = statsElement.querySelector('[data-visits]');
                const pageviewsElement = statsElement.querySelector('[data-pageviews]');
                if (visitsElement && pageviewsElement) {
                  visitsElement.textContent = data.visits?.toLocaleString() || '0';
                  pageviewsElement.textContent = data.pageviews?.toLocaleString() || '0';
                }
              });
          }
        }}
      ></iframe>
      <div id="site-stats" class="grid grid-cols-2 gap-2.5">
        <div class="text-center rounded-xl bg-[var(--btn-regular-bg)] py-2.5">
          <div class="flex items-center justify-center gap-1 text-50 text-[0.7rem] mb-0.5">
            <Icon icon="material-symbols:person-outline" class="text-sm"></Icon>
            <span>访问量</span>
          </div>
          <div class="text-base font-bold text-90" data-visits>--</div>
        </div>
        <div class="text-center rounded-xl bg-[var(--btn-regular-bg)] py-2.5">
          <div class="flex items-center justify-center gap-1 text-50 text-[0.7rem] mb-0.5">
            <Icon icon="material-symbols:visibility-outline" class="text-sm"></Icon>
            <span>阅读量</span>
          </div>
          <div class="text-base font-bold text-90" data-pageviews>--</div>
        </div>
      </div>
    </div>
  {/if}
</div>
