<script lang="ts">
    import "../app.css";

    import Sidebar from "$lib/Sidebar.svelte";
    import CodeWindow from "$lib/CodeWindow.svelte";
    import { DarkMode } from "flowbite-svelte";
</script>

<svelte:head>
    <style>
        @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap");

        html {
            font-family: "IBM Plex Sans", sans-serif;
        }
    </style>
</svelte:head>

<div class="layout">
    <Sidebar />
    <div class="bg-slate-400" />
    <slot></slot>
</div>

<div class="absolute right-0 top-0 z-50 p-4">
    <DarkMode />
</div>

<style>
    .layout {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-columns: 320px 1px 1fr;
    }
</style>
