export default class ErrorHandle {
    static async handle(error: Error): Promise<boolean> {
        return true;
    }
}