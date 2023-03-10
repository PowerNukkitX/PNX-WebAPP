import ArtifactDataBean from "./ArtifactDataBean";

export default class ReleaseDataBean {
    public name: string
    public tagName: string
    public publishedAt: number
    public body: string
    public artifacts: Array<ArtifactDataBean>
}