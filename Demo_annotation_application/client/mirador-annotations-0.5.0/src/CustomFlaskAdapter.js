/** */
export default class CustomFlaskAdapter {

    constructor(annotationPageId, endpointUrl) {
      this.annotationPageId = annotationPageId;
      this.apiUrl = endpointUrl;
    }
  
    /** */
    async create(annotation) {
      const emptyAnnoPage = {
        id: this.annotationPageId,
        items: [],
        type: 'AnnotationPage',
      };

      let annotationPage =  await this.all();

      if (annotationPage){
        annotationPage.items.push(annotation);
        fetch(this.apiUrl, {
                body: JSON.stringify(annotationPage),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin':'*'
                },
                method: 'PATCH'
            });
      } else {
        annotationPage = emptyAnnoPage;
        annotationPage.items.push(annotation);
        fetch(this.apiUrl, {
            body: JSON.stringify(annotationPage),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin':'*'
            },
            method: 'POST'
        });
      }
        return annotationPage;
    }
  
    /** */
    async update(annotation) {
      const annotationPage = await this.all();
      if (annotationPage) {
        const currentIndex = annotationPage.items.findIndex((item) => item.id === annotation.id);
        annotationPage.items.splice(currentIndex, 1, annotation);
        await fetch(this.apiUrl, {
            body: JSON.stringify(annotationPage),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin':'*'
            },
            method: 'PATCH'
        })
        return annotationPage;
      }
      return null;
    }
  
    /** */
    async delete(annoId) {
        let annotationPage = await this.all();
        if (annotationPage) {
            annotationPage.items = annotationPage.items.filter((item) => item.id !== annoId);
        }
        await fetch(this.apiUrl, {
            body: JSON.stringify(annotationPage),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin':'*'
            },
            method: 'DELETE'
        })
        return annotationPage;
    }
  
    /** */
    async get(annoId) {
        const annotationPage = await this.all();
        if (annotationPage) {
            return annotationPage.items.find((item) => item.id === annoId);
        }
        return null;
    }
  
    /** */
    async all() { 
        let annotationPageId = this.annotationPageId;
        return await fetch(this.apiUrl, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin':'*'
            },
            method: 'GET'
        })
        .then(resp => resp.json())
        .then(function(annotationPages){
            let res = annotationPages[annotationPageId];
            if (res != undefined){
                return JSON.parse(res);
            }
            else {
                return res;
            }
        });
    }
  }
  