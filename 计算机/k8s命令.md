# 用过的 k8s 命令

```shell
# 查看pod
kubectl get pod
# 查看namespace下的pod
kubectl get pod -n <namespace>
# 进入pod
kubectl exec -n <namespace> -it <pod> -- bash
# 查看日志
kubectl logs -f <pod>

docker load -i xxx.tar
kubectl delete -f xxx.yaml
kubectl create -f xxx.yaml

# 复制容器内部文件到本地
kubectl cp <namespace>/<pod_name>:<container_path> <local_file_path>

# 复制本地文件到容器内部
kubectl cp <local_file_path> <namespace>/<pod_name>:<container_path>
```
