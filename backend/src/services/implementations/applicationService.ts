import { OrganizerApplicationMapper } from "../../dtos/applicationDto.js";
import type { IApplicationRepository } from "../../repositories/interfaces/IApplicationRepository.js";
import type { IUserRepository } from "../../repositories/interfaces/IUserRepository.js";
import { uploadFile } from "../../utils/cloudinary.js";
import { HttpResponse } from "../../utils/constants/httpResponse.js";
import { HttpStatusCode } from "../../utils/constants/httpStatusCode.js";
import type { ApplicationStatus, IOrganizerApplication } from "../../utils/types/IOrganizerApplication.js";
import type { ApplicationsReturnType, CommonReturnType } from "../../utils/types/ReturnTypes.js";
import type { IApplicationService } from "../interfaces/IApplicationService.js";

export class ApplicationService implements IApplicationService {
    constructor(
        private _repo: IApplicationRepository,
        private _userRepo: IUserRepository
    ) { }

    async createApplication(formData: Partial<IOrganizerApplication>): Promise<CommonReturnType> {
        if (!formData.identityProofPath) {
            return {
                message: HttpResponse.ID_PROOF_MISSING,
                statusCode: HttpStatusCode.BAD_REQUEST
            }
        }

        const upload = await uploadFile(formData.identityProofPath);
        formData.identityProofId = upload.public_id;
        formData.identityProofPath = upload.secure_url;
        await this._repo.save(formData);
        return {
            message: HttpResponse.APPLICATION_SUBMITTED,
            statusCode: HttpStatusCode.CREATED
        }
    }

    async getApplications(page: number, search: string = "", limit: number = 10): Promise<ApplicationsReturnType> {
        const offset = (page - 1) * limit;

        const query = search.trim().length > 0 ? {
            $or: [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { organization: { $regex: search, $options: "i" } }
            ]
        }
            : {};
        const [applications, total] = await Promise.all([
            this._repo.findAllWithQuery(query, offset, limit),
            this._repo.count(query)
        ]);

        const pages = Math.ceil(total / limit);

        return {
            message: HttpResponse.APPLICATIONS_FETCHED,
            statusCode: HttpStatusCode.OK,
            applications: OrganizerApplicationMapper.toAdminDTOList(applications),
            page,
            pages,
            total
        }
    }

    async changeApplicationStatus(userId: string, applicationId: string, status: string): Promise<CommonReturnType> {
        const application = await this._repo.findById(applicationId);
        if (!application) {
            return {
                message: HttpResponse.APPLICATION_NOT_FOUND,
                statusCode: HttpStatusCode.NOT_FOUND
            }
        }

        await this._repo.update(applicationId, {status: status as ApplicationStatus});
        const user = await this._userRepo.findById(userId);
        if (user) {
            await this._userRepo.updateRole(userId, [...new Set([...user.roles, "organizer"])]);
        }
        return {
            message: `Application ${status}`,
            statusCode: HttpStatusCode.OK
        }
    }
}