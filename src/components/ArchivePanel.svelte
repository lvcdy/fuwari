<script lang="ts">
import { onMount } from "svelte";
import ArchiveGroup from "./archive/ArchiveGroup.svelte";
import {
	filterArchivePosts,
	groupArchivePosts,
	type ArchiveFilters,
	type ArchiveGroup,
	type ArchivePost,
} from "../utils/archive-utils";

export let sortedPosts: ArchivePost[] = [];

let archiveFilters = getArchiveFilters();
let filteredPosts: ArchivePost[] = [];
let groups: ArchiveGroup[] = [];

function getArchiveFilters(): ArchiveFilters {
	const params = new URLSearchParams(window.location.search);

	return {
		tags: params.has("tag") ? params.getAll("tag") : [],
		categories: params.has("category") ? params.getAll("category") : [],
		uncategorized: params.has("uncategorized"),
	};
}

$: filteredPosts = filterArchivePosts(sortedPosts, archiveFilters);
$: groups = groupArchivePosts(filteredPosts);

onMount(() => {
	const syncFilters = () => {
		archiveFilters = getArchiveFilters();
	};

	window.addEventListener("popstate", syncFilters);
	document.addEventListener("astro:after-swap", syncFilters);

	return () => {
		window.removeEventListener("popstate", syncFilters);
		document.removeEventListener("astro:after-swap", syncFilters);
	};
});
</script>

<div class="card-base px-8 py-6">
	{#each groups as group}
		<ArchiveGroup {group} />
	{/each}
</div>
