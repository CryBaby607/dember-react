import { format } from "date-fns";

export const formatTime = (date) => {
    return format(date, "h:mm a");
};
