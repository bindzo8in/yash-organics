"use server";

import { Resend } from "resend";
import { z } from "zod";
import { AdminContactEmail } from "@/components/emails/admin-contact-email";
import { ClientContactEmail } from "@/components/emails/client-contact-email";
import { env } from "@/lib/env";
import { ContactFormData, contactSchema } from "../validators/contact";

const resend = new Resend(env.RESEND_API_KEY);




