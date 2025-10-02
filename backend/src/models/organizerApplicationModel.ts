import { model, Schema } from "mongoose";
import { ApplicationStatus, type IOrganizerApplication } from "../utils/types/IOrganizerApplication.js";

const ApplicationSchema = new Schema<IOrganizerApplication>(
	{
		fullName: { type: String, required: true },
		email: { type: String, required: true },
		userId: {type: Schema.Types.ObjectId, required: true, ref: "User"},
		phone: { type: String, required: true },
		address: { type: String, required: true },
		city: { type: String, required: true },
		state: { type: String, required: true },
		zipCode: { type: String, required: true },
		organization: { type: String },
		organizationType: { type: String, required: true },
		experience: { type: String, required: true },
		previousEvents: { type: String },
		motivation: { type: String, required: true },
		identityProofId: {type: String, required: true},
		identityProofPath: { type: String, required: true },
		identityProofType: { type: String, required: true },
		identityProofNumber: { type: String, required: true },
		status: {
			type: String,
			enum: Object.values(ApplicationStatus),
			default: ApplicationStatus.PENDING
		},
	},
	{ timestamps: true }
);

const organizerApplicationModel = model<IOrganizerApplication>(
	"OrganizerApplication",
	ApplicationSchema
);

export default organizerApplicationModel;
