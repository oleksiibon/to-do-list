class TaskService extends CrudService{
  getTaskForList(list) {
    return super.request("GET", {empty: true}, "?listId=" + list);
  }

  change(list, body){
    return super.request("PATCH", body, "/" + list);
  }
}
