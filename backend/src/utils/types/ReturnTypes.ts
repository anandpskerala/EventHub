import type { OrganizerApplicationAdminDTO, OrganizerApplicationDTO } from "../../dtos/applicationDto.js";
import type { BookingAdminDTO, BookingDTO } from "../../dtos/bookingDto.js";
import type { EventAdminDTO, EventDTO } from "../../dtos/eventDto.js";
import type { UserDTO } from "../../dtos/userDto.js";
import type { WalletDTO } from "../../dtos/walletDto.js";
import type { HttpStatusCode } from "../constants/httpStatusCode.js";

export interface UserReturnType {
    message: string;
    statusCode: HttpStatusCode;
    user?: UserDTO,
    accessToken?: string,
    refreshToken?: string
}

export interface CommonReturnType {
    message: string;
    statusCode: HttpStatusCode;
}

export interface ApplicationsReturnType {
    message: string;
    statusCode: HttpStatusCode;
    applications?: OrganizerApplicationAdminDTO[] | OrganizerApplicationDTO[];
    page?: number;
    total?: number;
    pages?: number;
}

export interface EventReturnType {
    message: string;
    statusCode: HttpStatusCode;
    event?: EventDTO;
}

export interface EventsReturnType {
    message: string;
    statusCode: HttpStatusCode;
    events?: EventDTO[] | EventAdminDTO[];
    page?: number;
    total?: number;
    pages?: number;
}

export interface BookingReturnType {
    message: string;
    statusCode: HttpStatusCode;
    booking?: BookingDTO | BookingAdminDTO;
}

export interface BookingsReturnType {
    message: string;
    statusCode: HttpStatusCode;
    bookings?: BookingAdminDTO[] | BookingDTO[];
    page?: number;
    total?: number;
    pages?: number;
}

export interface WalletReturnType {
    message: string; 
    statusCode: HttpStatusCode; 
    wallet?: WalletDTO | undefined;
}