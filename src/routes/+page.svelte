<script lang="ts">
    import { ids } from "$lib/data/assets";
    import { onMount } from "svelte";
    



    let slots = $state<(string | null)[]>(Array(12).fill(null));
    let open = $state(false);
    let activeIndex = $state<number | null>(null);

    let dropdownPos = $state({ top: 0, left: 0 });

    let container: HTMLDivElement;

    function removeId(index: number) {
        slots[index] = null;
        slots = [...slots];
    }
    function openPicker(index: number, event: MouseEvent) {
        activeIndex = index;

        const rect = (
            event.currentTarget as HTMLElement
        ).getBoundingClientRect();
        const parentRect = container.getBoundingClientRect();

        dropdownPos = {
            top: rect.bottom - parentRect.top + 6,
            left: rect.left - parentRect.left,
        };

        open = true;
    }

    function addId(name: string) {
        if (activeIndex !== null) {
            slots[activeIndex] = name;
            slots = [...slots];
            open = false;
            activeIndex = null;
        }
    }

    function autoResize(e: Event) {
        const el = e.target as HTMLTextAreaElement;

        el.style.height = "auto"; // reset
        el.style.height = el.scrollHeight + "px"; // grow to fit
    }

    onMount(() => {
        const handleClick = (e: MouseEvent) => {
            if (!container?.contains(e.target as Node)) {
                open = false;
                activeIndex = null;
            }
        };

        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    });
</script>

<div class="fullpage">

    <div class="guidemaker">
        <div class="guideinfo">
            <div class="textfield">
                <textarea
                    rows="3"
                    oninput={(e) => autoResize(e)}
                    class="title"
                    placeholder="Guide title here..."
                />
            </div>
            <div class="textfield">
                <textarea
                    rows="3"
                    oninput={(e) => autoResize(e)}
                    class="introduction"
                    placeholder="Write a description here..."
                />
            </div>
        </div>
        <div bind:this={container} style="position: relative;" class="idpicker">
            <div class="grid">
                {#each slots as slot, i}
                    <div class="cell" onclick={(event) => openPicker(i, event)}>
                        {#if slot}
                            {@const id = ids.find((i) => i.name === slot)}
                            {#if id}
                                <div class="cell-content">
                                    <img src={id.image} alt={id.name} />
                                    <p class="label">{id.name}</p>

                                    <button
                                        class="remove"
                                        onclick={(e) => {
                                            e.stopPropagation();
                                            removeId(i);
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            {/if}
                        {:else}
                            <span>+</span>
                        {/if}
                    </div>
                {/each}
            </div>

            {#if open}
                <div
                    class="dropdown"
                    style="top: {dropdownPos.top}px; left: {dropdownPos.left}px;"
                >
                    {#each ids as id}
                        <div
                            class="card"
                            onclick={(e) => {
                                e.stopPropagation();
                                addId(id.name);
                            }}
                        >
                            <img src={id.image} alt={id.name} />
                            <p>{id.name}</p>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>
    
    


<style>
    :global(body) {
        margin: 0;
        background-color: #170404;
    }
    .fullpage {
        display: flex;
        flex-direction: column;
        padding: 25px;
        margin: 0;
        width: 100%;
        min-height: 100vh;
        background-color: #170404;
        box-sizing: border-box;
    }

    .guidemaker {
        display: flex;
        flex-direction: column;
        width: 70%;
        
        align-content: center;
        justify-content: center;
        align-self: center;
        gap: 30px;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 10px;
        margin-bottom: 12px;
        height: 20vw;
    }

    .cell {
        background: #363636;
        border-radius: 8px;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 10vw;
        min-height: 20vw;
        cursor: pointer;
        color: white;
        padding: 6px;
        text-align: center;
    }

    .cell img {
        display: flex;
        z-index: 100000;
        width: 100%;
        height: auto;
        max-height: 90%;
        object-fit: contain;
        align-self: center;
        justify-self: center;
        border-radius: 6px;
        margin-top: 5px;
    }

    .cell span {
        font-size: 50px;
        opacity: 0.6;
    }

    .dropdown {
        position: absolute;
        z-index: 1000;
        top: 0;
        left: -100px;
        display: flex;
        gap: 12px;
        overflow-x: auto;

        padding: 10px;
        background: #111;
        border-radius: 8px;

        max-width: 90vw;
    }

    .card {
        min-width: 110px;
        text-align: center;
        background: #1a1a1a;
        border-radius: 6px;
        padding: 6px;
        cursor: pointer;
        color: white;
    }

    .card img {
        width: 100%;
        border-radius: 4px;
    }

    .card:hover {
        transform: scale(1.05);
    }

    .label {
        font-size: 15px;
        margin-top: 4px;
        line-height: 1.1;
        color: white;

        overflow: hidden;
        text-overflow: ellipsis;
    }

    .cell-content {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .remove {
        position: absolute;
        top: 4px;
        right: 4px;

        background: rgba(0, 0, 0, 0.7);
        border: none;
        color: white;

        border-radius: 50%;
        width: 22px;
        height: 22px;

        cursor: pointer;
        font-size: 14px;
        line-height: 1;
    }

    .remove:hover {
        background: red;
    }

    .guideinfo {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 25px;
    }

    .textfield {
        display: flex;
        justify-content: center;
        align-items: center;
        white-space: pre-wrap;
        word-break: break-word;
        overflow-wrap: break-word;
        resize: vertical;
        width: 100%;
    }

    textarea {
        width: 100%;
        min-height: 20px;
        resize: none;
        overflow: hidden;

        background: #111;
        color: white;
        border: 1px solid #333;
        border-radius: 6px;
        padding: 8px;

        white-space: pre-wrap;
        word-break: break-word;
    }

    
</style>
