<script lang="ts">
    import { ids, gifts, packs } from "$lib/data/assets";
    import { onMount, tick } from "svelte";

    let slots = $state<(string | null)[]>(Array(12).fill(null));
    let open = $state(false);
    let activeIndex = $state<number | null>(null);
    let dropdownEl: HTMLDivElement;
    let floors = $state([
        {
            pack: null as string | null,
            gifts: [] as (string | null)[],
            description: "",
        },
    ]);

    function addFloor() {
        floors = [...floors, { pack: null, gifts: [], description: "" }];
    }

    let pickerTarget = $state<{
        type: "pack" | "gift";
        floorIndex: number;
        giftIndex?: number;
    } | null>(null);

    function removeFloor(index: number) {
        floors = floors.filter((_, i) => i !== index);
    }

    let dropdownPos = $state({ top: 0, left: 0 });
    let container: HTMLDivElement;

    function removeId(index: number) {
        slots[index] = null;
        slots = [...slots];
    }

    async function positionDropdown(rect: DOMRect) {
        await tick(); // wait for dropdown to exist

        const dropdownHeight = dropdownEl?.offsetHeight ?? 0;
        const spacing = 6;

        let top = rect.bottom + spacing;

        // flip if needed (viewport-based)
        if (rect.bottom + dropdownHeight > window.innerHeight) {
            top = rect.top - dropdownHeight - spacing;
        }

        dropdownPos = {
            top: top + window.scrollY,
            left: rect.left + window.scrollX,
        };
    }

    function openIdPicker(index: number, event: MouseEvent) {
        event.stopPropagation();

        activeIndex = index;
        pickerTarget = null;

        const rect = (
            event.currentTarget as HTMLElement
        ).getBoundingClientRect();

        open = true;

        positionDropdown(rect);
    }

    function addId(name: string): void {
        if (activeIndex !== null) {
            slots[activeIndex] = name;
            slots = [...slots];

            open = false;
            activeIndex = null;
        }
    }

    function addFloorId(name: string): void {
        if (!pickerTarget) return;

        const { type, floorIndex, giftIndex } = pickerTarget;

        if (type === "pack") {
            floors[floorIndex].pack = name;
        }

        if (type === "gift" && giftIndex !== undefined) {
            floors[floorIndex].gifts[giftIndex] = name;
        }

        floors = [...floors];

        open = false;
        pickerTarget = null;
    }

    function openFloorPicker(
        type: "pack" | "gift",
        floorIndex: number,
        event: MouseEvent,
        giftIndex?: number,
    ): void {
        event.stopPropagation();

        const rect = (
            event.currentTarget as HTMLElement
        ).getBoundingClientRect();

        activeIndex = null;
        pickerTarget = { type, floorIndex, giftIndex };

        open = true;

        positionDropdown(rect);
    }

    function autoResize(e: Event) {
        const el = e.target as HTMLTextAreaElement;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }

    onMount(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                !container?.contains(e.target as Node) &&
                !dropdownEl?.contains(e.target as Node)
            ) {
                open = false;
                activeIndex = null;
                pickerTarget = null;
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
                    oninput={autoResize}
                    class="title"
                    placeholder="Guide title here..."
                />
            </div>
            <div class="textfield">
                <textarea
                    rows="3"
                    oninput={autoResize}
                    class="introduction"
                    placeholder="Write a description here..."
                />
            </div>
        </div>

        <div bind:this={container} style="position: relative;" class="idpicker">
            <div class="grid">
                {#each slots as slot, i}
                    <div
                        class="cell"
                        onclick={(event) => openIdPicker(i, event)}
                    >
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
                    bind:this={dropdownEl}
                    style="top: {dropdownPos.top}px; left: {dropdownPos.left}px;"
                >
                    {#each pickerTarget?.type === "pack" ? packs : pickerTarget?.type === "gift" ? gifts : ids as item}
                        <div
                            class="card"
                            onclick={(e) => {
                                e.stopPropagation();

                                if (pickerTarget) {
                                    addFloorId(item.name);
                                } else {
                                    addId(item.name);
                                }
                            }}
                        >
                            <img src={item.image} alt={item.name} />
                            <p>{item.name}</p>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="floors">
            <button onclick={addFloor}>+ Add Floor</button>

            {#each floors as floor, fi}
                <div class="floor">
                    <div
                        class="pack"
                        onclick={(e) => {
                            e.stopPropagation();
                            openFloorPicker("pack", fi, e);
                        }}
                    >
                        {#if floor.pack}
                            {@const pack = packs.find(
                                (i) => i.name === floor.pack,
                            )}
                            {#if pack}
                                <img src={pack.image} />
                                <p>{pack.name}</p>
                            {/if}
                        {:else}
                            <span>Select Pack</span>
                        {/if}
                    </div>

                    <div class="gifts">
                        {#each floor.gifts as gift, gi}
                            <div
                                class="gift"
                                onclick={(e) => {
                                    e.stopPropagation();
                                    openFloorPicker("gift", fi, e, gi);
                                }}
                            >
                                {#if gift}
                                    {@const giftItem = gifts.find(
                                        (i) => i.name === gift,
                                    )}
                                    {#if giftItem}
                                        <img src={giftItem.image} />
                                        <p class="gift-label">
                                            {giftItem.name}
                                        </p>
                                    {/if}
                                {:else}
                                    <span>+</span>
                                {/if}
                            </div>
                        {/each}

                        <button
                            onclick={() => {
                                floor.gifts = [...floor.gifts, null];
                                floors = [...floors];
                            }}
                        >
                            + Gift
                        </button>
                    </div>

                    <div class="desc">
                        <textarea
                            bind:value={floor.description}
                            oninput={autoResize}
                            placeholder="Floor explanation..."
                        />
                    </div>

                    <button onclick={() => removeFloor(fi)}>Remove Floor</button
                    >
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        background-color: #170404;
        overflow-y: auto;
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
        align-self: center;
        gap: 30px;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 10px;
        margin-bottom: 12px;
    }

    .cell {
        background: #363636;
        border-radius: 8px;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;

        width: 100%;
        min-height: 180px; /* 👈 controls height */
        padding: 6px;

        cursor: pointer;
        color: white;
        text-align: center;
    }

    .cell img {
        width: 100%;
        height: auto;
        max-height: 140px; /* 👈 keeps it portrait */
        object-fit: contain;
        border-radius: 6px;
    }

    .cell span {
        font-size: 50px;
        opacity: 0.6;
    }

    .dropdown {
    position: fixed;
    z-index: 1000;

    display: flex;
    gap: 12px;
    overflow-x: auto;

    padding: 10px;
    background: #111;
    border-radius: 8px;

    max-width: 90vw;

    /* 🔥 ADD THESE */
    width: max-content;
    max-height: 60vh;
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
        font-size: 13px;
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
    }

    .remove:hover {
        background: red;
    }

    .guideinfo {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 25px;
    }

    .textfield {
        width: 100%;
    }

    textarea {
        width: 100%;
        resize: none;
        overflow: hidden;
        background: #111;
        color: white;
        border: 1px solid #333;
        border-radius: 6px;
        padding: 8px;
    }

    .floors {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .floor {
        display: grid;
        grid-template-columns: 150px 1fr 1fr;
        gap: 15px;
        background: #2a0d0d;
        padding: 10px;
        border-radius: 8px;
    }

    .pack,
    .gift {
        background: #222;
        border-radius: 6px;
        padding: 6px;
        cursor: pointer;
        color: white;
        text-align: center;
    }

    .pack img,
    .gift img {
        width: 100%;
    }

    .gifts {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    .desc textarea {
        min-height: 100px;
    }

    button {
        background: linear-gradient(135deg, #2a0d0d, #4a1414);
        color: #f5d0a9;
        border: 1px solid #7a2a2a;
        border-radius: 8px;
        padding: 8px 14px;
        cursor: pointer;
    }

    button:hover {
        background: linear-gradient(135deg, #3a1212, #6a1f1f);
        box-shadow: 0 0 8px rgba(255, 80, 80, 0.3);
    }
    .gift-label {
        font-size: 12px;
        margin-top: 4px;
        line-height: 1.1;
        color: white;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .gift {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        width: 80px;
    }
</style>
