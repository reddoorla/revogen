<script lang="ts">
  import { page } from "$app/state";
</script>

<div class="flex h-[75vh] w-full flex-col items-center justify-center text-center text-white px-6">
  <h1 class="text-6xl font-bold">{page.status}</h1>
  <p class="mt-4 text-lg">{page.error?.message ?? "Something went wrong."}</p>
</div>
