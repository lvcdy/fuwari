<script lang="ts">
  import { onMount } from 'svelte';
  import {
    type ArchiveFilters,
    type ArchiveGroup as ArchiveGroupType,
    type ArchivePost,
    filterArchivePosts,
    groupArchivePosts,
  } from '../utils/archive-utils';
  import ArchiveGroup from './archive/ArchiveGroup.svelte';

  export let sortedPosts: ArchivePost[] = [];

  let archiveFilters = getArchiveFilters();
  let filteredPosts: ArchivePost[] = [];
  let groups: ArchiveGroupType[] = [];

  function getArchiveFilters(): ArchiveFilters {
    const params = new URLSearchParams(window.location.search);

    return {
      tags: params.has('tag') ? params.getAll('tag') : [],
      categories: params.has('category') ? params.getAll('category') : [],
      uncategorized: params.has('uncategorized'),
    };
  }

  $: filteredPosts = filterArchivePosts(sortedPosts, archiveFilters);
  $: groups = groupArchivePosts(filteredPosts);

  onMount(() => {
    const syncFilters = () => {
      archiveFilters = getArchiveFilters();
    };

    window.addEventListener('popstate', syncFilters);
    document.addEventListener('astro:after-swap', syncFilters);

    return () => {
      window.removeEventListener('popstate', syncFilters);
      document.removeEventListener('astro:after-swap', syncFilters);
    };
  });
</script>

<div class="card-base px-8 py-6">
  {#each groups as group}
    <ArchiveGroup {group} />
  {/each}
</div>
