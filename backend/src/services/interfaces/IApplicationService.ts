import type { IOrganizerApplication } from "../../utils/types/IOrganizerApplication.js";
import type { ApplicationsReturnType, CommonReturnType } from "../../utils/types/ReturnTypes.js";

export interface IApplicationService {
    createApplication(formData: Partial<IOrganizerApplication>): Promise<CommonReturnType>;
    getApplications(page: number, search: string, limit: number): Promise<ApplicationsReturnType>;
    changeApplicationStatus(userId: string, applicationId: string, status: string): Promise<CommonReturnType>;
}