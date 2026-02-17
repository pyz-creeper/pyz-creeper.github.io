document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector("#filter-search");
    const typeSelect = document.querySelector("#filter-type");
    const dateSelect = document.querySelector("#filter-date");
    const items = document.querySelectorAll("#pub-list .pub-list-item");

    function applyFilters() {
        const keyword = searchInput.value.toLowerCase().trim();
        const typeValue = typeSelect.value;
        const dateValue = dateSelect.value;

        items.forEach(item => {
            const title = item.dataset.title || "";
            const authors = item.dataset.authors || ""; // 获取我们在第二步添加的数据
            const minor = item.dataset.minor || "";
            const year = parseInt(item.dataset.year);

            let visible = true;

            // 搜索过滤：同时匹配标题和作者
            if (keyword) {
                const matchesTitle = title.includes(keyword);
                const matchesAuthors = authors.includes(keyword);
                
                if (!matchesTitle && !matchesAuthors) {
                    visible = false;
                }
            }

            // Type 过滤
            if (typeValue && minor !== typeValue) {
                visible = false;
            }

            // Date 过滤
            if (dateValue) {
                if (dateValue === "<=2020") {
                    if (year > 2020) visible = false;
                } else {
                    if (year.toString() !== dateValue) visible = false;
                }
            }

            item.style.display = visible ? "" : "none";
        });
    }

    searchInput.addEventListener("input", applyFilters);
    typeSelect.addEventListener("change", applyFilters);
    dateSelect.addEventListener("change", applyFilters);
});