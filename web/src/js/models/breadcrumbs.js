export default class Breadcrumbs {
  constructor(breadcrumbs) {
    this.breadcrumbs = breadcrumbs;
  }

  toJSONLD() {
    return {
      '@context': 'http://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: this.breadcrumbs.map((breadcrumb, index) => {
        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@id': breadcrumb.url,
            name: breadcrumb.title,
          }
        }
      })
    };
  }
}
