export default class RepoDataBean {
    public id: string;
    public owner: string;
    public name: string;
    public description: string | null;
    public mainLanguage: string;
    public lastUpdateAt: Date;
    public topics: string[] | null;
    public star: number;
    public iconDownloadID: number;
    public pluginName: string | null;
    public mainClass: string | null;
    public dependencies: string[] | null;
    public softDependencies: string[] | null;
    public banned: boolean;
    public qualityScore: number;
    public editorRecommendScore: number;
    public lastFullIndexTime: Date;

    static fromJSON(json: any): RepoDataBean {
        const bean = new RepoDataBean();
        bean.id = json.id;
        bean.owner = json.owner;
        bean.name = json.name;
        bean.description = json.description;
        bean.mainLanguage = json.mainLanguage;
        bean.lastUpdateAt = new Date(json.lastUpdateAt);
        if (json.topics) {
            if (json.topics instanceof String) {
                bean.topics = json.topics.split(" ");
            } else {
                bean.topics = json.topics;
            }
        }
        bean.topics = json.topics;
        bean.star = json.star;
        bean.iconDownloadID = json.iconDownloadID;
        bean.pluginName = json.pluginName;
        bean.mainClass = json.mainClass;
        bean.dependencies = json.dependencies;
        bean.softDependencies = json.softDependencies;
        bean.banned = json.banned;
        bean.qualityScore = json.qualityScore;
        bean.editorRecommendScore = json.editorRecommendScore;
        bean.lastFullIndexTime = new Date(json.lastFullIndexTime);
        return bean;
    }

    static fromJSONString(jsonString: string): RepoDataBean {
        return RepoDataBean.fromJSON(JSON.parse(jsonString));
    }
}