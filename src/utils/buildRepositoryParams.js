const formatQualifierValue = (value) => {
    const sanitizedValue = String(value)
        .trim()
        .replace(/["\\]/g, '');

    if (sanitizedValue.includes(' ')) {
        return `"${sanitizedValue}"`;
    }

    return sanitizedValue;
};

const isValidPositiveNumber = (value) => {
    return value !== undefined &&
        value !== null &&
        value !== '' &&
        Number.isInteger(Number(value)) &&
        Number(value) >= 0;
};

const getPushedDate = (value) => {
    if (!value) {
        return null;
    }

    const stringValue = String(value).trim();

    // Allows an exact date such as: 2026-05-12
    if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
        return stringValue;
    }

    // Allows a number of days such as: 7, 30 or 365
    const days = Number(stringValue);

    if (!Number.isInteger(days) || days <= 0) {
        return null;
    }

    const date = new Date();

    date.setUTCDate(date.getUTCDate() - days);

    return date.toISOString().split('T')[0];
};

const buildRepositoryParams = ({
    search,
    language,
    stars,
    forks,
    date,
    topic,
    license,
    sort,
    order,
    page = 1,
    perPage = 10
}) => {
    const queryParts = [];

    if (search?.trim()) {
        queryParts.push(search.trim());
    }

    if (language) {
        queryParts.push(
            `language:${formatQualifierValue(language)}`
        );
    }

    if (isValidPositiveNumber(stars)) {
        queryParts.push(`stars:>=${Number(stars)}`);
    }

    if (isValidPositiveNumber(forks)) {
        queryParts.push(`forks:>=${Number(forks)}`);
    }

    const pushedDate = getPushedDate(date);

    if (pushedDate) {
        queryParts.push(`pushed:>=${pushedDate}`);
    }

    if (topic) {
        queryParts.push(
            `topic:${formatQualifierValue(topic)}`
        );
    }

    if (license) {
        queryParts.push(
            `license:${formatQualifierValue(license)}`
        );
    }

    const params = new URLSearchParams({
        q: queryParts.join(' '),
        page: String(page),
        per_page: String(perPage)
    });

    const allowedSortValues = ['stars', 'forks', 'updated'];
    const allowedOrderValues = ['asc', 'desc'];

    if (allowedSortValues.includes(sort)) {
        params.set('sort', sort);
    }

    if (allowedOrderValues.includes(order)) {
        params.set('order', order);
    }

    return params;
};

module.exports = buildRepositoryParams;
