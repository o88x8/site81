



const icons = {

    scp: "🔴",

    "grabbable-scp": "🟢",

    keycard: "🔑",

    item: "📦",

    medical: "💊",

    door: "🚪",

    other: "⚙️"

};

const typeNames = {

    scp: "SCP",

    "grabbable-scp":
        "GRABBABLE SCP",

    keycard:
        "KEYCARD",

    item:
        "ITEM",

    medical:
        "MEDICAL",

    door:
        "DOOR",

    other:
        "OTHER"

};




let state = {

    zones: {},

    currentZone: null,

    editMode: false,

    filter: "all",

    search: "",

    zoom: 1

};

let editingMarkerId = null;

let selectedMarkerId = null;

let draggingMarker = null;




const zoneList =
    document.getElementById(
        "zoneList"
    );

const mapContainer =
    document.getElementById(
        "mapContainer"
    );

const mapContent =
    document.getElementById(
        "mapContent"
    );

const mapImage =
    document.getElementById(
        "mapImage"
    );

const markerLayer =
    document.getElementById(
        "markerLayer"
    );

const emptyMap =
    document.getElementById(
        "emptyMap"
    );

const zoomValue =
    document.getElementById(
        "zoomValue"
    );











const infoPanel =
    document.getElementById(
        "infoPanel"
    );

const infoIcon =
    document.getElementById(
        "infoIcon"
    );

const infoTitle =
    document.getElementById(
        "infoTitle"
    );

const infoType =
    document.getElementById(
        "infoType"
    );

const infoNotes =
    document.getElementById(
        "infoNotes"
    );

const markerTooltip =
    document.getElementById(
        "markerTooltip"
    );

const tooltipName =
    document.getElementById(
        "tooltipName"
    );

const tooltipType =
    document.getElementById(
        "tooltipType"
    );

const tooltipNotes =
    document.getElementById(
        "tooltipNotes"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const filterSelect =
    document.getElementById(
        "filterSelect"
    );




function status(message, error = false) {
 const el = document.getElementById('saveStatus');
 el.textContent = message; el.style.color = error ? '#ff7d89' : '#70dcff';
}
async function loadState() {
 const response = await fetch('./map-data.json', {cache: 'no-store'});
 if (!response.ok) throw new Error('Map data could not load.');
 state.zones = await response.json();
 state.currentZone = Object.keys(state.zones)[0] || null;
 status('View only');
}



function getCurrentZone() {

    if (
        !state.currentZone ||
        !state.zones[
            state.currentZone
        ]
    ) {

        return null;
    }

    return state.zones[
        state.currentZone
    ];
}




function renderZones() {

    zoneList.innerHTML = "";

    Object.entries(
        state.zones
    ).forEach(
        ([name, zone]) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "zone-item" +
                (
                    name ===
                    state.currentZone
                        ? " active"
                        : ""
                );

            const nameEl =
                document.createElement(
                    "div"
                );

            nameEl.className =
                "zone-name";

            nameEl.textContent =
                name;

            const count =
                document.createElement(
                    "div"
                );

            count.className =
                "zone-count";

            count.textContent =
                zone.markers?.length || 0;

            item.appendChild(
                nameEl
            );

            item.appendChild(
                count
            );

            item.addEventListener(
                "click",
                () => {

                    state.currentZone =
                        name;

                    closeInfoPanel();

                    hideTooltip();

                    renderZones();

                    renderMap();

                }
            );

            zoneList.appendChild(
                item
            );

        }
    );

}




function renderMap() {

    const zone =
        getCurrentZone();

    if (!zone) {
        return;
    }

    mapImage.src =
        zone.image || "";

    if (zone.image) {

        emptyMap.classList.add(
            "hidden"
        );

    } else {

        emptyMap.classList.remove(
            "hidden"
        );

    }

    renderMarkers();

    applyMapTransform();

}




function renderMarkers() {

    markerLayer.innerHTML = "";

    const zone =
        getCurrentZone();

    if (!zone) {
        return;
    }

    const filter =
        state.filter;

    const search =
        state.search
            .trim()
            .toLowerCase();

    zone.markers.forEach(
        markerData => {

            if (
                filter !== "all" &&
                markerData.type !==
                filter
            ) {

                return;
            }

            if (
                search &&
                !markerData.name
                    .toLowerCase()
                    .includes(search)
            ) {

                return;
            }

            const marker =
                document.createElement(
                    "div"
                );

            marker.className =
                `marker ${markerData.type}`;

            marker.textContent =
                icons[
                    markerData.type
                ] || "⚙️";

            marker.dataset.id =
                markerData.id;

            marker.style.left =
                markerData.x + "%";

            marker.style.top =
                markerData.y + "%";

            marker.addEventListener(
                "mouseenter",
                event => {

                    showTooltip(
                        markerData,
                        event
                    );

                }
            );

            marker.addEventListener(
                "mouseleave",
                hideTooltip
            );

            marker.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    openInfoPanel(markerData);

                }
            );

            markerLayer.appendChild(
                marker
            );

        }
    );

}




function applyMapTransform() {

    zoomValue.textContent =
        Math.round(
            state.zoom * 100
        ) + "%";

    mapContent.style.transform =
        `translate(-50%, -50%) scale(${state.zoom})`;

}




function openInfoPanel(markerData) {

    selectedMarkerId =
        markerData.id;

    infoIcon.textContent =
        icons[
            markerData.type
        ] || "⚙️";

    infoTitle.textContent =
        markerData.name;

    infoType.textContent =
        typeNames[
            markerData.type
        ] || "OTHER";

    infoNotes.textContent =
        markerData.notes ||
        "No notes.";

    infoPanel.classList.add(
        "show"
    );

}

function closeInfoPanel() {

    selectedMarkerId =
        null;

    infoPanel.classList.remove(
        "show"
    );

}

document.getElementById(
    "infoCloseBtn"
).addEventListener(
    "click",
    closeInfoPanel
);




function showTooltip(
    markerData,
    event
) {

    tooltipName.textContent =
        markerData.name;

    tooltipType.textContent =
        typeNames[
            markerData.type
        ] || "OTHER";

    tooltipNotes.textContent =
        markerData.notes || "";

    markerTooltip.style.left =
        event.clientX + 12 + "px";

    markerTooltip.style.top =
        event.clientY + 12 + "px";

    markerTooltip.classList.add(
        "show"
    );

}

function hideTooltip() {

    markerTooltip.classList.remove(
        "show"
    );

}




filterSelect.addEventListener(
    "change",
    event => {

        state.filter =
            event.target.value;

        renderMarkers();

    }
);




searchInput.addEventListener(
    "input",
    event => {

        state.search =
            event.target.value;

        renderMarkers();

    }
);




document.getElementById(
    "zoomIn"
).addEventListener(
    "click",
    () => {

        state.zoom =
            Math.min(
                5,
                state.zoom + .1
            );

        applyMapTransform();

    }
);

document.getElementById(
    "zoomOut"
).addEventListener(
    "click",
    () => {

        state.zoom =
            Math.max(
                .2,
                state.zoom - .1
            );

        applyMapTransform();

    }
);

document.getElementById(
    "zoomReset"
).addEventListener(
    "click",
    () => {

        state.zoom = 1;

        applyMapTransform();

    }
);




document.addEventListener(
    "keydown",
    event => {
        if (event.target.matches("input, textarea, select")) return;

        if (
            event.key ===
            "Escape"
        ) {



            closeInfoPanel();

            hideTooltip();

        }

        if (
            event.key === "+" ||
            event.key === "="
        ) {

            state.zoom =
                Math.min(
                    5,
                    state.zoom + .1
                );

            applyMapTransform();

        }

        if (
            event.key === "-"
        ) {

            state.zoom =
                Math.max(
                    .2,
                    state.zoom - .1
                );

            applyMapTransform();

        }

        if (
            event.key === "0"
        ) {

            state.zoom = 1;

            applyMapTransform();

        }

    }
);




async function initialize() {
    const app = document.querySelector('.app');
    app.inert = true;
    status('Loading JSON…');
    try {
        await loadState();
        renderZones();
        renderMap();
        mapContainer.classList.toggle('editing', state.editMode);
        app.inert = false;
    } catch (error) {
        status('Could not load JSON', true);
        console.error(error);
    }
}
initialize();
