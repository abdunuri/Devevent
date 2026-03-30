import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/database/event.model";
export async function POST(req:NextRequest) {
    try {
        await connectToDatabase();
        const formData = await req.formData();
        let event;
        try {
            event= Object.fromEntries(formData.entries())
        } catch (error) {
            return NextResponse.json({message:"Invalid json Format"},{status:400})
        }

        const createdEvent  = await Event.create(event);
        return NextResponse.json({message:"Event Created Succesfully",event:createdEvent},{status:201})
    } catch (e) {
        console.error(e);
        return NextResponse.json({message:"Event Creation Filed",error:e instanceof Error ? e.message:"unknown"},{status:500});
        }
    }
