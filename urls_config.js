const MAX_CONTENT_LENGTH_PER_DOCUMENT = 500;
export const urlObjects = [
    {
        url: "https://healthvietnam.vn/thu-vien/tai-lieu-tieng-viet/vi-sinh-vat",
        origin: "https://healthvietnam.vn/thu-vien/tai-lieu-tieng-viet/vi-sinh-vat",
        excludes: [],
        getDocFunc: ($, _url) => {
            const data = $(".tailieufullcontent");
            const title = data.find("h2").text().replace(/\s\s+/g, ' ').replace(/\t+|\n+/g, ' ');

            const contents = []
            data.find("p").each((i, el) =>
                contents.push($(el).text().replace(/\s\s+/g, ' ').replace(/\t+|\n+/g, ' ')));

            const subDocumemts = [];
            for (const content of contents) {
                if (content.length != 0) {
                    subDocumemts.push({
                        title: title,
                        content: content,
                        domain: _url
                    });
                }
            }
            return subDocumemts;
        }
    },
    {
        url: "https://www.chungvisinh.com/",
        origin: "https://www.chungvisinh.com/",
        excludes: ["/wp-content/uploads"],
        getDocFunc: ($, _url) => {

            const title = $(".single-title").text().replace(/\s\s+/g, ' ').replace(/\t+|\n+/g, ' ');

            const contents = [];
            $(".thecontent").children('p').each((i, el) =>
                contents.push($(el).text().replace(/\s\s+/g, ' ').replace(/\t+|\n+/g, ' ')));

            const subDocumemts = [];
            for (const content of contents) {
                if (content.length != 0) {
                    subDocumemts.push({
                        title: title,
                        content: content,
                        domain: _url
                    });
                }
            }
            return subDocumemts;
        }
    }
];

export const validUrl = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;

export default urlObjects;